const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'closet.db'));

// Enable Foreign Keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    image_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS outfit_items (
    outfit_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    FOREIGN KEY (outfit_id) REFERENCES outfits (id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
  );
`);

// Safe Migration: ensure subcategory column exists if table was already created previously
const itemColumns = db.prepare("PRAGMA table_info(items)").all();
const hasSubcategory = itemColumns.some((col) => col.name === 'subcategory');
if (!hasSubcategory) {
  db.exec('ALTER TABLE items ADD COLUMN subcategory TEXT');
}

module.exports = db;