import { useState } from 'react';

const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Bags',
  'Accessories',
];

export default function OutfitBuilder({ isOpen, onClose, items, onSave }) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedItemIds.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSave({ name, itemIds: selectedItemIds });
      setName('');
      setSelectedItemIds([]);
      onClose();
    } catch (err) {
      console.error('Failed to create outfit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-line bg-cream shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line p-6 bg-white">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Create Outfit</h2>
            <p className="text-xs text-inksoft mt-1">Select pieces across categories to build your look.</p>
          </div>
          <button
            onClick={onClose}
            className="text-inksoft transition-colors hover:text-wine font-medium text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-inksoft">
              Outfit Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autumn Casual, Dinner Date"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full max-w-md rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-wine"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 border-b border-line pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-ink text-cream'
                    : 'bg-white text-inksoft hover:bg-line/30 hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clothing Items Grid */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-md border transition-all ${
                    isSelected
                      ? 'border-wine ring-2 ring-wine/30 bg-white'
                      : 'border-line bg-white hover:border-inksoft'
                  }`}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-cream/30">
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-center">
                    <p className="truncate text-xs font-medium text-ink">{item.name}</p>
                  </div>

                  {/* Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-wine text-[10px] font-bold text-cream">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-line p-4 bg-white">
          <span className="text-sm font-medium text-inksoft">
            {selectedItemIds.length} {selectedItemIds.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-inksoft transition-colors hover:bg-line/20"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!name || selectedItemIds.length === 0 || isSubmitting}
              onClick={handleSubmit}
              className="rounded-md bg-wine px-5 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Outfit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}