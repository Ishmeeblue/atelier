import { useState } from 'react';
import { CATEGORIES, SUBCATEGORIES } from '../constants/categories';

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'Tops');
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[CATEGORIES[0]]?.[0] || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const subcats = SUBCATEGORIES[newCat] || [];
    setSubcategory(subcats[0] || 'Unsorted');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !imageFile) {
      setError('Please fill in all required fields and select an image.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('subcategory', subcategory || 'Unsorted');
      formData.append('image', imageFile); // Must match upload.single('image') in backend

      await onAdd(formData);

      // Reset form and close
      setName('');
      setCategory(CATEGORIES[0]);
      setSubcategory(SUBCATEGORIES[CATEGORIES[0]]?.[0] || '');
      setImageFile(null);
      setPreviewUrl('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSubcategories = SUBCATEGORIES[category] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl font-body">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-display text-xl font-semibold text-ink">Add New Closet Item</h2>
          <button
            onClick={onClose}
            className="text-inksoft hover:text-ink text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silk Black Blouse"
              required
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-wine focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink">Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-wine focus:outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink">Subcategory / Type</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-wine focus:outline-none bg-white"
            >
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="Unsorted">Unsorted</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink">Item Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="mt-1 w-full text-xs text-inksoft file:mr-4 file:rounded-md file:border-0 file:bg-wine file:px-4 file:py-2 file:text-xs file:font-medium file:text-cream hover:file:opacity-90"
            />
          </div>

          {previewUrl && (
            <div className="relative h-32 w-full overflow-hidden rounded-md border border-line bg-cream/20">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-xs font-medium text-inksoft hover:bg-line/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-wine px-4 py-2 text-xs font-medium text-cream shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}