import { useState } from 'react';
import { CATEGORIES, SUBCATEGORIES } from '../constants/categories';
import { removeBackground } from '@imgly/background-removal';

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || 'Tops');
  const [subcategory, setSubcategory] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const availableSubcategories = SUBCATEGORIES[category] || [];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError('');
    setIsRemovingBg(true);

    try {
      // Automatically remove background using AI in the browser
      const transparentBlob = await removeBackground(selectedFile);
      
      // Convert Blob to a clean PNG file object
      const processedFile = new File(
        [transparentBlob],
        selectedFile.name.replace(/\.[^/.]+$/, '') + '.png',
        { type: 'image/png' }
      );

      setFile(processedFile);
      setPreviewUrl(URL.createObjectURL(processedFile));
    } catch (err) {
      console.error('Background removal failed, using original image:', err);
      // Fallback to original file if background removal encounters any issue
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !file) {
      setError('Please provide a name, category, and image.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('subcategory', subcategory || 'Unsorted');
      formData.append('image', file);

      await onAdd(formData);

      // Reset form fields and close modal
      setName('');
      setCategory(CATEGORIES[0] || 'Tops');
      setSubcategory('');
      setFile(null);
      setPreviewUrl('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl font-body max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-display text-lg font-semibold text-ink">Add New Closet Item</h2>
          <button
            onClick={onClose}
            className="text-inksoft hover:text-ink text-lg font-bold p-1"
            type="button"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-medium text-ink">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brown Checkered Blouse"
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs text-ink focus:border-wine focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-ink">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory('');
              }}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs text-ink focus:border-wine focus:outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {availableSubcategories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-ink">Subcategory / Type</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs text-ink focus:border-wine focus:outline-none bg-white"
              >
                <option value="">Select Subcategory (Optional)</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Selector */}
          <div>
            <label className="block text-xs font-medium text-ink">Item Image</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="cursor-pointer rounded-md bg-wine px-3 py-2 text-xs font-medium text-cream hover:opacity-90 transition-opacity">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-inksoft truncate max-w-[200px]">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* Background Removal Loading Indicator */}
          {isRemovingBg && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-cream/30 p-3 text-xs text-wine">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-wine border-t-transparent"></div>
              <span>Removing background automatically...</span>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && !isRemovingBg && (
            <div className="relative flex items-center justify-center h-48 w-full overflow-hidden rounded-md border border-line bg-cream/10">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                Background Removed
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-line pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-line/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isRemovingBg}
              className="rounded-md bg-wine px-4 py-2 text-xs font-medium text-cream hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}