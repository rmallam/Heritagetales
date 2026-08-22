const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

const items = db.prepare('SELECT id, title FROM items').all();

const updateStmt = db.prepare(`
  UPDATE items SET image_url = ?, additional_images = ? WHERE id = ?
`);

for (const item of items) {
  const encodedTitle = encodeURIComponent(item.title.replace(/ /g, '+'));
  const primaryImage = `https://placehold.co/800x800/111111/b5955b?text=${encodedTitle}`;
  const additionalImage = `https://placehold.co/1200x1200/111111/b5955b?text=${encodedTitle}+(Alternate)`;
  
  updateStmt.run(primaryImage, JSON.stringify([additionalImage]), item.id);
}

console.log('Fixed image URLs in the database!');
