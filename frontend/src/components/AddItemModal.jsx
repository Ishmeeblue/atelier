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