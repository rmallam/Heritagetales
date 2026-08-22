'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { Item } from './db';

export async function getItems(): Promise<Item[]> {
  try {
    const { rows } = await sql<Item>`SELECT * FROM items ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
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

export async function addItem(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priceStr = formData.get('price') as string;
  const image_url = formData.get('image_url') as string;
  const additionalStr = formData.get('additional_images') as string;

  if (!title || !priceStr) {
    throw new Error('Title and price are required.');
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
