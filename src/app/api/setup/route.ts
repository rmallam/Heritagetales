import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        additional_images TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create the orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        stripe_session_id TEXT UNIQUE NOT NULL,
        amount_total REAL NOT NULL,
        status TEXT NOT NULL,
        items_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try { await sql`ALTER TABLE orders ADD COLUMN carrier TEXT`; } catch (e) {}
    try { await sql`ALTER TABLE orders ADD COLUMN tracking_number TEXT`; } catch (e) {}

    // 2. Clear existing dummy data (optional, but ensures a clean slate)
    await sql`DELETE FROM items`;

    // 3. Insert the 4 premium brass items
    const seedItems = [
      {
        title: 'Vintage Brass Miniatures Set',
        description: 'A beautiful collection of vintage brass miniature items including tiny pitchers, irons, mortar and pestles, and candelabras. Perfect for collectors or unique shelf decor.',
        price: 125.00,
        image_url: '/images/miniatures.jpg',
        additional_images: JSON.stringify([])
      },
      {
        title: 'Golden Brass Deer Figurine',
        description: 'An elegant, polished golden brass deer figurine. Adds a touch of woodland grace and premium shine to your living room or study.',
        price: 85.00,
        image_url: '/images/deer.jpg',
        additional_images: JSON.stringify([])
      },
      {
        title: 'Antique Brass Measuring Cups Set',
        description: 'A set of traditional brass measuring cups with loop handles. Can be used as rustic planters, desk organizers, or authentic kitchen decor.',
        price: 110.00,
        image_url: '/images/cups.jpg',
        additional_images: JSON.stringify([])
      },
      {
        title: 'Ornate Brass Dragonfly Decor',
        description: 'A stunningly detailed brass dragonfly with intricate cut-out wing patterns. Cast beautiful shadows when placed in direct sunlight.',
        price: 65.00,
        image_url: '/images/dragonfly.jpg',
        additional_images: JSON.stringify([])
      }
    ];

    for (const item of seedItems) {
      await sql`
        INSERT INTO items (title, description, price, image_url, additional_images)
        VALUES (${item.title}, ${item.description}, ${item.price}, ${item.image_url}, ${item.additional_images})
      `;
    }

    return NextResponse.json({ success: true, message: 'Vercel Postgres Database Initialized and Seeded!' });
  } catch (error: unknown) {
    console.error('Database setup error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
