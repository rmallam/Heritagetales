const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

try {
  db.exec(`ALTER TABLE items ADD COLUMN additional_images TEXT DEFAULT '[]'`);
  console.log('Added additional_images column');
} catch (e) {
  console.log('Column might already exist:', e.message);
}
