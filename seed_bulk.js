const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

const stmt = db.prepare(`
  INSERT INTO items (title, description, price, image_url, additional_images)
  VALUES (?, ?, ?, ?, ?)
`);

const items = [
  {
    title: 'Antique Brass Ganesha Idol (Large)',
    description: 'A beautifully handcrafted, heavy solid brass Ganesha idol. Perfect for the entrance or pooja room. Features intricate carvings from South Indian artisans.',
    price: 189.00,
    image_url: 'https://images.unsplash.com/photo-1621255855018-c0b74fb68d9f?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1621255855018-c0b74fb68d9f?w=1200&auto=format&fit=crop'])
  },
  {
    title: 'Handcrafted Brass Urli with Bells',
    description: 'Traditional Indian Urli bowl decorated with small hanging bells. Fill it with water and floating flower petals to welcome guests and positive energy into your home.',
    price: 145.00,
    image_url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&auto=format&fit=crop'])
  },
  {
    title: 'Traditional Kerala Nilavilakku (2 Feet)',
    description: 'A majestic 24-inch traditional Kerala oil lamp. Made of premium grade brass, this heavy piece is a must-have for all auspicious occasions and daily prayers.',
    price: 225.00,
    image_url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=1200&auto=format&fit=crop'])
  },
  {
    title: 'Brass Pooja Thali Set (8 Pieces)',
    description: 'Complete daily pooja set including a thali (plate), bell, incense holder, deepam, and small bowls. Everything you need in one matching premium set.',
    price: 85.00,
    image_url: 'https://images.unsplash.com/photo-1602158865611-6670868f7fba?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1602158865611-6670868f7fba?w=1200&auto=format&fit=crop'])
  },
  {
    title: 'Decorative Brass Elephant Pair',
    description: 'A stunning pair of decorative brass elephants. Signifying strength, wisdom, and good luck, these heavy figurines are perfect for your mantelpiece or console table.',
    price: 160.00,
    image_url: 'https://images.unsplash.com/photo-1603531980846-9318b82be6c6?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1603531980846-9318b82be6c6?w=1200&auto=format&fit=crop'])
  },
  {
    title: 'Solid Brass Spice Box (Masala Dabba)',
    description: 'A beautifully crafted authentic brass masala dabba. Keeps your spices fresh and adds an incredibly traditional, rich look to your kitchen counter.',
    price: 95.00,
    image_url: 'https://images.unsplash.com/photo-1596647464338-04eec47d3493?w=800&auto=format&fit=crop',
    additional_images: JSON.stringify(['https://images.unsplash.com/photo-1596647464338-04eec47d3493?w=1200&auto=format&fit=crop'])
  }
];

// Optional: clear out the old dummy items first so the store looks super clean
db.exec('DELETE FROM items');

for (const item of items) {
  stmt.run(item.title, item.description, item.price, item.image_url, item.additional_images);
}

console.log('Seeded bulk items!');
