'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { Item } from './db';

export async function checkIsAdmin() {
  const { userId } = auth();
  return userId && userId === process.env.ADMIN_USER_ID;
}

export async function getItems(searchQuery?: string): Promise<Item[]> {
  try {
    if (searchQuery) {
      const qs = `%${searchQuery}%`;
      const { rows } = await sql<Item>`
        SELECT * FROM items 
        WHERE is_active = true 
        AND (title ILIKE ${qs} OR description ILIKE ${qs})
        ORDER BY created_at DESC
      `;
      return rows;
    }
    const { rows } = await sql<Item>`SELECT * FROM items WHERE is_active = true ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Error fetching items:', error);
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

export async function getItem(id: string): Promise<Item | undefined> {
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

  try {
    await sql`
      INSERT INTO items (title, description, price, image_url, additional_images, variants, stock_count, tags)
      VALUES (${title}, ${description}, ${price}, ${image_url}, ${additional_images}, ${variants}, ${stockCount}, ${tags})
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
