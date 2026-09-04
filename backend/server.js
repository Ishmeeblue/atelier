const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ITEMS ENDPOINTS
app.get('/api/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
  res.json(items);
});

app.post('/api/items', upload.single('photo'), (req, res) => {
  const { name, category } = req.body;
  if (!name || !category || !req.file) {
    return res.status(400).json({ error: 'Name, category, and photo are required.' });
  }
  const image_path = `/uploads/${req.file.filename}`;
  const createdAt = new Date().toISOString();

  // Added created_at to query to fix NOT NULL constraint error
  const stmt = db.prepare('INSERT INTO items (name, category, image_path, created_at) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, category, image_path, createdAt);
  
  res.json({ id: result.lastInsertRowid, name, category, image_path, created_at: createdAt });
});

app.delete('/api/items/:id', (req, res) => {
  // Ensure the ID is treated as an integer by SQLite
  const id = parseInt(req.params.id, 10);

  try {
    // 1. Fetch item to get the image path before deleting
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // 2. Transaction: Remove outfit links, then remove item
    const deleteTransaction = db.transaction((itemId) => {
      db.prepare('DELETE FROM outfit_items WHERE item_id = ?').run(itemId);
      db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    });
    
    // Execute the transaction
    deleteTransaction(id);

    // 3. Delete physical image file from the disk
    if (item.image_path) {
      const filename = path.basename(item.image_path);
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error('--- BACKEND ERROR DELETING ITEM ---');
    console.error(error);
    // Send exact error message to the browser for debugging
    res.status(500).json({ error: error.message || 'Failed to delete item' });
  }
});

// OUTFITS ENDPOINTS
app.get('/api/outfits', (req, res) => {
  const outfits = db.prepare('SELECT * FROM outfits ORDER BY created_at DESC').all();
  const getOutfitItems = db.prepare(`
    SELECT i.* FROM items i
    JOIN outfit_items oi ON i.id = oi.item_id
    WHERE oi.outfit_id = ?
  `);

  const result = outfits.map((outfit) => ({
    ...outfit,
    items: getOutfitItems.all(outfit.id),
  }));

  res.json(result);
});

app.post('/api/outfits', (req, res) => {
  const { name, itemIds } = req.body;
  if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'Name and at least one item are required.' });
  }

  const createdAt = new Date().toISOString();
  const insertOutfit = db.prepare('INSERT INTO outfits (name, created_at) VALUES (?, ?)');
  const insertLink = db.prepare('INSERT INTO outfit_items (outfit_id, item_id) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    const info = insertOutfit.run(name, createdAt);
    const outfitId = info.lastInsertRowid;
    for (const itemId of itemIds) {
      insertLink.run(outfitId, itemId);
    }
    return outfitId;
  });

  const newId = transaction();
  res.json({ id: newId, name, itemIds, created_at: createdAt });
});

app.delete('/api/outfits/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const deleteTransaction = db.transaction((outfitId) => {
      db.prepare('DELETE FROM outfit_items WHERE outfit_id = ?').run(outfitId);
      db.prepare('DELETE FROM outfits WHERE id = ?').run(outfitId);
    });
    
    deleteTransaction(id);
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('--- BACKEND ERROR DELETING OUTFIT ---');
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to delete outfit' });
  }
});

// Serve static frontend files (if built)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});