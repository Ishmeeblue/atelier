import { useState, useEffect } from 'react';
import { fetchItems, createItem, deleteItem } from '../services/api';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import ItemPreviewModal from '../components/ItemPreviewModal';
import { CATEGORIES, SUBCATEGORIES } from '../constants/categories';

export default function Closet() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load closet items');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, []);

  const handleAddItem = async (formData) => {
    const newItem = await createItem(formData);
    setItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (previewItem && previewItem.id === id) {
        setPreviewItem(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedSubcategory !== 'All' && item.subcategory !== selectedSubcategory) {
      return false;
    }
    return true;
  });

  const availableSubcategories = selectedCategory === 'All' 
    ? [] 
    : (SUBCATEGORIES[selectedCategory] || []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">My Closet</h1>
          <p className="text-sm text-inksoft mt-1">Manage your wardrobe items and collections</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-wine px-4 py-2.5 text-xs font-medium text-cream shadow-sm hover:opacity-90 transition-opacity"
        >
          + Add New Item
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setSelectedSubcategory('All');
          }}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            selectedCategory === 'All'
              ? 'bg-wine text-cream'
              : 'bg-line/20 text-ink hover:bg-line/40'
          }`}
        >
          All Items
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedSubcategory('All');
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-wine text-cream'
                : 'bg-line/20 text-ink hover:bg-line/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedCategory !== 'All' && availableSubcategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-inksoft mr-2">Subcategory:</span>
          <button
            onClick={() => setSelectedSubcategory('All')}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              selectedSubcategory === 'All'
                ? 'bg-ink text-cream'
                : 'bg-line/10 text-ink hover:bg-line/30'
            }`}
          >
            All
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-ink text-cream'
                  : 'bg-line/10 text-ink hover:bg-line/30'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 text-center text-sm text-inksoft">Loading your closet...</div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-12 text-center">
          <p className="text-sm text-inksoft">No items found in this view.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 rounded-md bg-wine/10 px-4 py-2 text-xs font-medium text-wine hover:bg-wine/20"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={handleDeleteItem}
              onClick={() => setPreviewItem(item)}
            />
          ))}
        </div>
      )}

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      <ItemPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}