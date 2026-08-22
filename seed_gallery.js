const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'store.db'));

const stmt = db.prepare(`
  UPDATE items SET additional_images = ? WHERE id = 1
`);

stmt.run(JSON.stringify([
  "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2940&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=2940&auto=format&fit=crop"
]));

console.log("Updated item 1 with additional images");
