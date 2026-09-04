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
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('--- BACKEND ERROR FETCHING ITEMS ---', error);
    res.status(500).json({ error: error.message || 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('--- MULTER UPLOAD ERROR ---', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    try {
      const { name, category, subcategory } = req.body;
      
      if (!name || !category || !req.file) {
        return res.status(400).json({ error: 'Name, category, and image are required.' });
      }
      
      const image_path = `/uploads/${req.file.filename}`;
      const createdAt = new Date().toISOString();

      const stmt = db.prepare(
        'INSERT INTO items (name, category, subcategory, image_path, created_at) VALUES (?, ?, ?, ?, ?)'
      );
      
      // Set fallback to 'Unsorted' to ensure filtering behaves correctly
      const result = stmt.run(name, category, subcategory || 'Unsorted', image_path, createdAt);

      res.status(201).json({
        id: result.lastInsertRowid,
        name,
        category,
        subcategory: subcategory || 'Unsorted',
        image_path,
        created_at: createdAt,
      });
    } catch (error) {
      console.error('--- BACKEND ERROR CREATING ITEM ---', error);
      res.status(500).json({ error: error.message || 'Failed to create item' });
    }
  });
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteTransaction = db.transaction((itemId) => {
      db.prepare('DELETE FROM outfit_items WHERE item_id = ?').run(itemId);
      db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    });

    deleteTransaction(id);

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
    res.status(500).json({ error: error.message || 'Failed to delete item' });
  }
});

// OUTFITS ENDPOINTS
app.get('/api/outfits', (req, res) => {
  try {
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
  } catch (error) {
    console.error('--- BACKEND ERROR FETCHING OUTFITS ---', error);
    res.status(500).json({ error: error.message || 'Failed to fetch outfits' });
  }
});

app.post('/api/outfits', (req, res) => {
  const { name, itemIds } = req.body;
  if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'Name and at least one item are required.' });
  }

  try {
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

    // Fetch the full item objects for this new outfit so the frontend state matches GET /api/outfits
    const getOutfitItems = db.prepare(`
      SELECT i.* FROM items i
      JOIN outfit_items oi ON i.id = oi.item_id
      WHERE oi.outfit_id = ?
    `);
    const createdItems = getOutfitItems.all(newId);

    res.status(201).json({ 
      id: newId, 
      name, 
      items: createdItems, 
      created_at: createdAt 
    });
  } catch (error) {
    console.error('--- BACKEND ERROR CREATING OUTFIT ---', error);
    res.status(500).json({ error: error.message || 'Failed to create outfit' });
  }
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