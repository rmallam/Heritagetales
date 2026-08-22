const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

const stmt = db.prepare(`
  INSERT INTO items (title, description, price, image_url, additional_images)
  VALUES (?, ?, ?, ?, ?)
`);

const items = [
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

// Clear out the placeholder items
db.exec('DELETE FROM items');

for (const item of items) {
  stmt.run(item.title, item.description, item.price, item.image_url, item.additional_images);
}

console.log('Seeded custom uploaded images!');
