'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { Item } from './db';

export async function checkIsAdmin() {
  const { userId } = auth();
  return userId && userId === process.env.ADMIN_USER_ID;
}

export async function getItems(searchQuery?: string, tag?: string, sort?: string): Promise<Item[]> {
  try {
    let baseQuery = `SELECT * FROM items WHERE is_active = true`;
    const params: (string | number)[] = [];
    
    if (searchQuery) {
      params.push(`%${searchQuery}%`);
      baseQuery += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    
    if (tag) {
      // Tags is a JSONB array, we check if it contains the tag string
      params.push(JSON.stringify([tag]));
      baseQuery += ` AND tags @> $${params.length}::jsonb`;
    }

    if (sort === 'price_asc') {
      baseQuery += ` ORDER BY price ASC`;
    } else if (sort === 'price_desc') {
      baseQuery += ` ORDER BY price DESC`;
    } else {
      baseQuery += ` ORDER BY created_at DESC`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { rows } = await sql.query(baseQuery, params);
    return rows as Item[];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export async function getRelatedItems(itemId: number, tags: string[]): Promise<Item[]> {
  if (!tags || tags.length === 0) return [];
  
  try {
    const params: (string | number)[] = [itemId];
    // Find items that have ANY of the tags, excluding the current item
    const tagConditions = tags.map((t, i) => {
      params.push(JSON.stringify([t]));
      return `tags @> $${i + 2}::jsonb`;
    }).join(' OR ');

    const query = `
      SELECT * FROM items 
      WHERE id != $1 AND is_active = true AND (${tagConditions})
      ORDER BY created_at DESC
      LIMIT 4
    `;
    const { rows } = await sql.query(query, params);
    return rows as Item[];
  } catch (error) {
    console.error('Error fetching related items:', error);
    return [];
  }
}

export async function getAllAdminItems(): Promise<Item[]> {
  try {
    const { rows } = await sql<Item>`SELECT * FROM items ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Error fetching admin items:', error);
    return [];
  }
}

export async function toggleItemStock(id: number, currentStock: boolean) {
  try {
    await sql`UPDATE items SET in_stock = ${!currentStock} WHERE id = ${id}`;
    revalidatePath('/');
    revalidatePath('/admin/items');
  } catch (e) {
    console.error(e);
  }
}

export async function toggleItemActive(id: number, currentActive: boolean) {
  try {
    await sql`UPDATE items SET is_active = ${!currentActive} WHERE id = ${id}`;
    revalidatePath('/');
    revalidatePath('/admin/items');
  } catch (e) {
    console.error(e);
  }
}

export async function getItemBySlug(slug: string): Promise<Item | undefined> {
  try {
    const { rows } = await sql<Item>`SELECT * FROM items WHERE slug = ${slug}`;
    return rows[0];
  } catch (error) {
    console.error('Error fetching item by slug:', error);
    return undefined;
  }
}

export async function getItem(id: number): Promise<Item | undefined> {
  try {
    const { rows } = await sql<Item>`SELECT * FROM items WHERE id = ${id}`;
    return rows[0];
  } catch (error) {
    console.error('Error fetching item:', error);
    return undefined;
  }
}

import { put } from '@vercel/blob';

export async function addItem(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priceStr = formData.get('price') as string;
  const imageFile = formData.get('image_file') as File;
  const additionalStr = formData.get('additional_images') as string;

  if (!title || !priceStr) {
    throw new Error('Title and price are required.');
  }

  let image_url = '';
  
  if (imageFile && imageFile.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('Vercel Blob token is missing! Cannot upload image. Please add Vercel Blob storage to your project.');
    } else {
      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
      });
      image_url = blob.url;
    }
  }

  const price = parseFloat(priceStr);
  const additional_images = additionalStr ? JSON.stringify(additionalStr.split(',').map(s => s.trim())) : '[]';
  const variants = formData.get('variants_json') as string || '[]';
  const stockCount = parseInt(formData.get('stock_count') as string) || 10;
  
  const tagsStr = formData.get('tags') as string || '';
  const tags = JSON.stringify(tagsStr.split(',').map(t => t.trim()).filter(Boolean));
  
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    await sql`
      INSERT INTO items (title, slug, description, price, image_url, additional_images, variants, stock_count, tags)
      VALUES (${title}, ${slug}, ${description}, ${price}, ${image_url}, ${additional_images}, ${variants}, ${stockCount}, ${tags})
    `;
    revalidatePath('/');
    revalidatePath('/admin/items');
  } catch (error) {
    console.error('Error inserting item:', error);
    throw new Error('Failed to insert item.');
  }
}

export async function updateItemStock(id: number, newStock: number) {
  try {
    await sql`UPDATE items SET stock_count = ${newStock} WHERE id = ${id}`;
    revalidatePath('/');
    revalidatePath('/admin/items');
  } catch (e) {
    console.error(e);
  }
}

export async function fulfillOrder(formData: FormData) {
  const id = formData.get('id') as string;
  const carrier = formData.get('carrier') as string;
  const trackingNumber = formData.get('tracking_number') as string;

  if (!id || !carrier || !trackingNumber) return;

  try {
    const { rows } = await sql`
      UPDATE orders 
      SET status = 'shipped', tracking_number = ${trackingNumber}, carrier = ${carrier}
      WHERE id = ${id}
      RETURNING customer_email, stripe_session_id
    `;
    
    if (rows.length > 0) {
      const order = rows[0];
      if (order.customer_email) {
        try {
          const { resend, fromEmail } = await import('@/lib/resend');
          if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: order.customer_email,
              subject: 'Your Order Has Shipped! - Heritage Tales',
              html: `
                <h1>Good news! Your order is on the way.</h1>
                <p>Order #${id} has been fulfilled and shipped via ${carrier}.</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p>Thank you for shopping with Heritage Tales.</p>
              `
            });
            if (error) {
              console.error('Resend API Error during Shipping Confirmation:', error);
            } else {
              console.log('Shipping confirmation email sent to:', order.customer_email, 'ID:', data?.id);
            }
          } else {
            console.log('[MOCK] Shipping confirmation email would be sent here.');
          }
        } catch (e) {
          console.error('Failed to send shipping confirmation email:', e);
        }
      }
    }
    
    revalidatePath('/admin/orders');
  } catch (error) {
    console.error('Error fulfilling order:', error);
  }
}

export async function getStoreSettings(): Promise<{ global_discount: number, is_sale_active: boolean }> {
  try {
    const { rows } = await sql`SELECT * FROM store_settings WHERE id = 1`;
    const row = rows[0];
    if (row) {
      return {
        global_discount: Number(row.global_discount),
        is_sale_active: Boolean(row.is_sale_active)
      };
    }
    return { global_discount: 0, is_sale_active: false };
  } catch {
    return { global_discount: 0, is_sale_active: false };
  }
}

export async function updateStoreSettings(formData: FormData) {
  const isSaleActive = formData.get('is_sale_active') === 'true';
  const discount = parseFloat(formData.get('global_discount') as string) || 0;

  try {
    await sql`
      UPDATE store_settings 
      SET is_sale_active = ${isSaleActive}, global_discount = ${discount}
      WHERE id = 1
    `;
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (err) {
    console.error('Error updating store settings:', err);
  }
}

export async function syncCart(userId: string | null, email: string | null, itemsJson: string) {
  if (!email && !userId) return; // Cannot track without identifier
  
  try {
    const { rows } = await sql`
      SELECT id FROM carts WHERE email = ${email} AND status = 'active'
    `;

    if (rows.length > 0) {
      await sql`
        UPDATE carts 
        SET items_json = ${itemsJson}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${rows[0].id}
      `;
    } else {
      await sql`
        INSERT INTO carts (user_id, email, items_json)
        VALUES (${userId}, ${email}, ${itemsJson})
      `;
    }
  } catch (error) {
    console.error('Failed to sync cart:', error);
  }
}

import { DiscountRule } from './db';

export async function getDiscountRules(): Promise<DiscountRule[]> {
  try {
    const { rows } = await sql<DiscountRule>`SELECT * FROM discount_rules ORDER BY id DESC`;
    return rows;
  } catch (error) {
    console.error('Error fetching discount rules:', error);
    return [];
  }
}

export async function addDiscountRule(formData: FormData) {
  const tag = formData.get('tag') as string;
  const discount = parseInt(formData.get('discount_percentage') as string);
  
  if (!tag || isNaN(discount)) return;

  try {
    await sql`
      INSERT INTO discount_rules (tag, discount_percentage)
      VALUES (${tag}, ${discount})
      ON CONFLICT (tag) DO UPDATE SET discount_percentage = EXCLUDED.discount_percentage
    `;
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error inserting discount rule:', error);
  }
}

export async function toggleDiscountRule(id: number, currentActive: boolean) {
  try {
    await sql`UPDATE discount_rules SET is_active = ${!currentActive} WHERE id = ${id}`;
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (e) {
    console.error(e);
  }
}

export async function deleteDiscountRule(id: number) {
  try {
    await sql`DELETE FROM discount_rules WHERE id = ${id}`;
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (e) {
    console.error(e);
  }
}

export async function getAvailableTags(): Promise<string[]> {
  try {
    const { rows } = await sql`
      SELECT DISTINCT jsonb_array_elements_text(tags) as tag
      FROM items
      WHERE is_active = true AND tags IS NOT NULL AND jsonb_typeof(tags) = 'array'
      ORDER BY tag
    `;
    return rows.map(r => r.tag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

import { Review } from './db';

// Wishlist Actions
export async function toggleWishlist(itemId: number) {
  const { userId } = auth();
  if (!userId) return { error: 'Not authenticated' };

  try {
    const { rowCount } = await sql`
      DELETE FROM wishlists WHERE user_id = ${userId} AND item_id = ${itemId}
    `;
    
    if (rowCount === 0) {
      await sql`
        INSERT INTO wishlists (user_id, item_id) VALUES (${userId}, ${itemId})
      `;
      return { added: true };
    }
    return { added: false };
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { error: 'Failed to toggle wishlist' };
  }
}

export async function getUserWishlists(): Promise<number[]> {
  const { userId } = auth();
  if (!userId) return [];

  try {
    const { rows } = await sql`SELECT item_id FROM wishlists WHERE user_id = ${userId}`;
    return rows.map(r => r.item_id);
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return [];
  }
}

export async function getWishlistedItems(): Promise<Item[]> {
  const { userId } = auth();
  if (!userId) return [];

  try {
    const { rows } = await sql<Item>`
      SELECT i.* FROM items i
      JOIN wishlists w ON i.id = w.item_id
      WHERE w.user_id = ${userId} AND i.is_active = true
      ORDER BY w.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching wishlisted items:', error);
    return [];
  }
}

// Review Actions
export async function addReview(formData: FormData) {
  const { userId } = auth();
  if (!userId) return { error: 'Not authenticated' };

  const itemId = parseInt(formData.get('item_id') as string);
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;
  const userName = formData.get('user_name') as string || 'Anonymous';

  if (!itemId || !rating) return { error: 'Missing required fields' };

  try {
    await sql`
      INSERT INTO reviews (item_id, user_id, user_name, rating, comment, is_approved)
      VALUES (${itemId}, ${userId}, ${userName}, ${rating}, ${comment}, true)
    `;
    revalidatePath('/product/[slug]', 'page');
    revalidatePath(`/product/${itemId}`);
    return { success: true };
  } catch (error) {
    console.error('Error adding review:', error);
    return { error: 'Failed to add review' };
  }
}

export async function addReviewResponse(id: number, response: string) {
  try {
    await sql`UPDATE reviews SET admin_response = ${response} WHERE id = ${id}`;
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[slug]', 'page');
  } catch (error) {
    console.error('Error adding review response:', error);
  }
}

export async function getApprovedReviews(itemId: number): Promise<Review[]> {
  try {
    const { rows } = await sql<Review>`
      SELECT * FROM reviews 
      WHERE item_id = ${itemId} AND is_approved = true
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return [];
  }
}

export async function getAllReviewsAdmin(): Promise<(Review & { item_title: string })[]> {
  try {
    const { rows } = await sql`
      SELECT r.*, i.title as item_title 
      FROM reviews r
      JOIN items i ON r.item_id = i.id
      ORDER BY r.created_at DESC
    `;
    return rows as (Review & { item_title: string })[];
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
}

export async function toggleReviewApproval(id: number, currentStatus: boolean) {
  try {
    await sql`UPDATE reviews SET is_approved = ${!currentStatus} WHERE id = ${id}`;
    revalidatePath('/admin/reviews');
    // We ideally would revalidate the specific product page too, but we don't have the item_id easily here
    // unless we query it first.
  } catch (error) {
    console.error('Error toggling review approval:', error);
  }
}

export async function deleteReview(id: number) {
  try {
    await sql`DELETE FROM reviews WHERE id = ${id}`;
    revalidatePath('/admin/reviews');
    revalidatePath('/product/[slug]', 'page');
  } catch (error) {
    console.error('Error deleting review:', error);
  }
}

import { BlogPost } from './db';

// Blog Actions
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const { rows } = await sql<BlogPost>`SELECT * FROM blog_posts ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const { rows } = await sql<BlogPost>`SELECT * FROM blog_posts WHERE slug = ${slug}`;
    return rows[0];
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return undefined;
  }
}

export async function addBlogPost(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const imageFile = formData.get('cover_image') as File;

  if (!title || !slug || !content) {
    throw new Error('Title, slug, and content are required.');
  }

  let cover_image = '';
  
  if (imageFile && imageFile.size > 0) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(imageFile.name, imageFile, { access: 'public' });
      cover_image = blob.url;
    }
  }

  try {
    await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, cover_image)
      VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${cover_image})
    `;
    revalidatePath('/journal');
    revalidatePath('/admin/blog');
  } catch (error) {
    console.error('Error adding blog post:', error);
    throw new Error('Failed to add blog post.');
  }
}

export async function deleteBlogPost(id: number) {
  try {
    await sql`DELETE FROM blog_posts WHERE id = ${id}`;
    revalidatePath('/journal');
    revalidatePath('/admin/blog');
  } catch (error) {
    console.error('Error deleting blog post:', error);
  }
}

// Dashboard Actions
export async function getDashboardStats() {
  try {
    // Basic stats
    const { rows: statRows } = await sql`
      SELECT 
        COUNT(id) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE status != 'cancelled'
    `;

    const totalOrders = parseInt(statRows[0].total_orders) || 0;
    const totalRevenue = parseFloat(statRows[0].total_revenue) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Recent orders
    const { rows: recentOrders } = await sql`
      SELECT id, customer_email, total_amount, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      recentOrders
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      recentOrders: []
    };
  }
}
