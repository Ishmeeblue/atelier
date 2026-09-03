const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.redirect('/closet.html');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.get('/api/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
  res.json(items);
});

app.post('/api/items', upload.single('photo'), (req, res) => {
  const { name, category } = req.body;

  if (!name || !category || !req.file) {
    return res.status(400).json({ error: 'name, category, and photo are all required' });
  }

  const imagePath = '/uploads/' + req.file.filename;

  const result = db.prepare(
    'INSERT INTO items (name, category, image_path, created_at) VALUES (?, ?, ?, ?)'
  ).run(name, category, imagePath, Date.now());

  const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newItem);
});

app.delete('/api/items/:id', (req, res) => {
  const id = req.params.id;

  db.prepare('DELETE FROM outfit_items WHERE item_id = ?').run(id);
  db.prepare('DELETE FROM items WHERE id = ?').run(id);

  res.status(204).send();
});

app.post('/api/outfits', (req, res) => {
  const { name, itemIds } = req.body;

  if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'name and a non-empty itemIds array are required' });
  }

  const createOutfit = db.transaction((name, itemIds) => {
    const result = db.prepare(
      'INSERT INTO outfits (name, created_at) VALUES (?, ?)'
    ).run(name, Date.now());

    const outfitId = result.lastInsertRowid;
    const insertLink = db.prepare('INSERT INTO outfit_items (outfit_id, item_id) VALUES (?, ?)');

    for (const itemId of itemIds) {
      insertLink.run(outfitId, itemId);
    }

    return outfitId;
  });

  const outfitId = createOutfit(name, itemIds);
  const outfit = db.prepare('SELECT * FROM outfits WHERE id = ?').get(outfitId);
  const items = db.prepare(`
    SELECT items.* FROM items
    JOIN outfit_items ON items.id = outfit_items.item_id
    WHERE outfit_items.outfit_id = ?
  `).all(outfitId);

  res.status(201).json({ ...outfit, items });
});

app.get('/api/outfits', (req, res) => {
  const outfits = db.prepare('SELECT * FROM outfits ORDER BY created_at DESC').all();

  const outfitsWithItems = outfits.map((outfit) => {
    const items = db.prepare(`
      SELECT items.* FROM items
      JOIN outfit_items ON items.id = outfit_items.item_id
      WHERE outfit_items.outfit_id = ?
    `).all(outfit.id);

    return { ...outfit, items };
  });

  res.json(outfitsWithItems);
});

app.delete('/api/outfits/:id', (req, res) => {
  const id = req.params.id;

  db.prepare('DELETE FROM outfit_items WHERE outfit_id = ?').run(id);
  db.prepare('DELETE FROM outfits WHERE id = ?').run(id);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});