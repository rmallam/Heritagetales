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

    try { await sql`ALTER TABLE items ADD COLUMN is_active BOOLEAN DEFAULT true`; } catch {}
    try { await sql`ALTER TABLE items ADD COLUMN in_stock BOOLEAN DEFAULT true`; } catch {}
    try { await sql`ALTER TABLE items ADD COLUMN variants JSONB DEFAULT '[]'::jsonb`; } catch {}
    try { await sql`ALTER TABLE items ADD COLUMN stock_count INTEGER DEFAULT 10`; } catch {}
    try { await sql`ALTER TABLE items ADD COLUMN tags JSONB DEFAULT '[]'::jsonb`; } catch {}

    // Create the discount rules table
    await sql`
      CREATE TABLE IF NOT EXISTS discount_rules (
        id SERIAL PRIMARY KEY,
        tag VARCHAR(255) UNIQUE NOT NULL,
        discount_percentage INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true
      );
    `;

    // Create the wishlists table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      );
    `;

    // Create the reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) DEFAULT 'Anonymous',
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT true,
        admin_response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Apply alters for existing databases
    await sql`ALTER TABLE reviews ALTER COLUMN is_approved SET DEFAULT true;`;
    await sql`UPDATE reviews SET is_approved = true WHERE is_approved = false;`;
    try {
      await sql`ALTER TABLE reviews ADD COLUMN admin_response TEXT;`;
    } catch {
      // Column might already exist
    }

    // Create the blog posts table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
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

    try { await sql`ALTER TABLE orders ADD COLUMN carrier TEXT`; } catch {}
    try { await sql`ALTER TABLE orders ADD COLUMN tracking_number TEXT`; } catch {}
    try { await sql`ALTER TABLE orders ADD COLUMN shipping_address TEXT`; } catch {}
    try { await sql`ALTER TABLE orders ADD COLUMN customer_email TEXT`; } catch {}

    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        id SERIAL PRIMARY KEY,
        global_discount REAL DEFAULT 0,
        is_sale_active BOOLEAN DEFAULT false
      )
    `;
    await sql`INSERT INTO store_settings (id, global_discount, is_sale_active) VALUES (1, 0, false) ON CONFLICT DO NOTHING`;

    // Create carts table for abandoned carts
    await sql`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        email TEXT,
        items_json TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json({ success: true, message: 'Vercel Postgres Database Schema Patched!' });
  } catch (error: unknown) {
    console.error('Database setup error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
