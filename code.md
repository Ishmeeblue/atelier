##database.js
```
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'closet.db'));

// Enable Foreign Keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
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

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

module.exports = db;
```

##ItemCard.js
```
export default function ItemCard({ item, onDelete }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-cream/50">
        <img
          src={item.image_path}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info Container */}
      <div className="flex flex-col justify-between p-3">
        <span className="text-xs font-medium uppercase tracking-wider text-inksoft">
          {item.category}
        </span>
        <h3 className="truncate font-display text-base font-medium text-ink">
          {item.name}
        </h3>
      </div>

      {/* Delete Button (Appears on Hover) */}
      <button
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-wine opacity-0 shadow-sm transition-opacity hover:bg-wine hover:text-cream group-hover:opacity-100"
        title="Delete Item"
      >
        ✕
      </button>
    </div>
  );
}
```

##AddItemModal.jsx
```
import { useState } from 'react';

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Bags',
  'Accessories',
];

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tops');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('photo', file);

    try {
      await onAdd(formData);
      setName('');
      setCategory('Tops');
      setFile(null);
      onClose();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-cream p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-xl font-semibold text-ink">Add Clothing Item</h2>
          <button
            onClick={onClose}
            className="text-inksoft transition-colors hover:text-wine"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-body">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inksoft">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vintage Linen Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-wine"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inksoft">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-wine"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inksoft">
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-inksoft file:mr-4 file:rounded-md file:border-0 file:bg-wine file:px-4 file:py-2 file:text-xs file:font-medium file:text-cream hover:file:opacity-90"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-inksoft transition-colors hover:bg-line/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-wine px-4 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Add to Closet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```
##api.js
```
// Clothes Items API Calls

export async function fetchItems() {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch('/api/items', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add clothing item');
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
  
  // Safely parse JSON only if the backend sends a body back
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// Outfits API Calls

export async function fetchOutfits() {
  const res = await fetch('/api/outfits');
  if (!res.ok) throw new Error('Failed to fetch outfits');
  return res.json();
}

export async function createOutfit(outfitData) {
  const res = await fetch('/api/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outfitData),
  });
  if (!res.ok) throw new Error('Failed to save outfit');
  return res.json();
}

export async function deleteOutfit(id) {
  const res = await fetch(`/api/outfits/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete outfit');

  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}
```