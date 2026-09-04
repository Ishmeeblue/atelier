import { useState, useMemo } from 'react';
import { CATEGORIES, SUBCATEGORIES } from '../constants/categories';

const FILTER_CATEGORIES = ['All', ...CATEGORIES];

export default function AddOutfitModal({ isOpen, onClose, onAdd, closetItems = [] }) {
  const [name, setName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook MUST be defined before any conditional early returns
  const filteredItems = useMemo(() => {
    return closetItems.filter((item) => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSubcategory = selectedSubcategory === 'All' || item.subcategory === selectedSubcategory;
      return matchCategory && matchSubcategory;
    });
  }, [closetItems, selectedCategory, selectedSubcategory]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  const toggleItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedItemIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await onAdd({ name, itemIds: selectedItemIds });
      setName('');
      setSelectedItemIds([]);
      setSelectedCategory('All');
      setSelectedSubcategory('All');
      onClose();
    } catch (err) {
      console.error('Failed to create outfit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-line bg-cream shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-xl font-semibold text-ink">Create New Outfit</h2>
          <button onClick={onClose} className="text-inksoft transition-colors hover:text-wine">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-5 flex flex-col min-h-0 font-body">
          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-inksoft">Outfit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Coffee Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-wine"
            />
          </div>

          <div className="mb-2">
            <span className="block text-xs font-medium uppercase tracking-wider text-inksoft">Select Items ({selectedItemIds.length} chosen)</span>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 shrink-0">
            <div className="flex flex-wrap gap-2">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-ink text-cream'
                      : 'bg-white text-inksoft border border-line hover:bg-line/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory !== 'All' && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory('All')}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedSubcategory === 'All'
                      ? 'bg-inksoft border-inksoft text-cream'
                      : 'bg-white border-line text-inksoft hover:bg-line/20'
                  }`}
                >
                  All {selectedCategory}
                </button>
                {SUBCATEGORIES[selectedCategory]?.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      selectedSubcategory === sub
                        ? 'bg-inksoft border-inksoft text-cream'
                        : 'bg-white border-line text-inksoft hover:bg-line/20'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Grid */}
          <div className="flex-1 overflow-y-auto rounded-md border border-line bg-white p-3">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-inksoft">No items found.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-md border-2 transition-all ${
                        isSelected ? 'border-wine shadow-md' : 'border-transparent hover:border-line'
                      }`}
                    >
                      <img src={item.image_path} alt={item.name} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-wine text-xs text-cream">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-inksoft transition-colors hover:bg-line/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name || selectedItemIds.length === 0}
            className="rounded-md bg-wine px-4 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Outfit'}
          </button>
        </div>
      </div>
    </div>
  );
}