const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'closet.db'));
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image_path TEXT,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS outfit_items (
    outfit_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    FOREIGN KEY (outfit_id) REFERENCES outfits(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
  )
`);

module.exports = db;