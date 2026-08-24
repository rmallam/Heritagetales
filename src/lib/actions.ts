'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { Item } from './db';

export async function checkIsAdmin() {
  const { userId } = auth();
  return userId && userId === process.env.ADMIN_USER_ID;
}

export async function getItems(): Promise<Item[]> {
  try {
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

  try {
    await sql`
      INSERT INTO items (title, description, price, image_url, additional_images)
      VALUES (${title}, ${description}, ${price}, ${image_url}, ${additional_images})
    `;
    revalidatePath('/');
  } catch (error) {
    console.error('Error inserting item:', error);
    throw new Error('Failed to insert item.');
  }
}

export async function fulfillOrder(formData: FormData) {
  const id = formData.get('id') as string;
  const carrier = formData.get('carrier') as string;
  const trackingNumber = formData.get('tracking_number') as string;

  if (!id || !carrier || !trackingNumber) return;

  try {
    await sql`
      UPDATE orders 
      SET status = 'shipped', carrier = ${carrier}, tracking_number = ${trackingNumber}
      WHERE id = ${id}
    `;
    revalidatePath('/admin');
    revalidatePath('/orders');
  } catch (err) {
    console.error('Error fulfilling order:', err);
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
