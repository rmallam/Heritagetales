const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const stmt = db.prepare(`
  INSERT INTO items (title, description, price, image_url)
  VALUES (?, ?, ?, ?)
`);

stmt.run(
  'Handcrafted Brass Deepam Lamp',
  'A heavy-duty solid brass deepam lamp perfect for daily pooja rituals. Weighs approximately 800g and holds oil for 12 hours of continuous burning.',
  45.00,
  'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2940&auto=format&fit=crop'
);

stmt.run(
  'Premium Brass Urli Bowl',
  'Beautiful traditional Kerala style Urli for floating flowers and candles. Perfect centerpiece for Diwali and festive decor.',
  120.00,
  'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=2940&auto=format&fit=crop'
);

console.log('Database seeded with sample brass items!');
