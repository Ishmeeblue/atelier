import { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import { fetchItems, createItem, deleteItem } from '../services/api';

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

export default function Closet() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load clothing items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddItem = async (formData) => {
    const newItem = await createItem(formData);
    setItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 font-body">
      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Closet</h1>
          <p className="mt-1 text-sm text-inksoft">
            Browse and organize your individual wardrobe pieces.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start rounded-md bg-wine px-5 py-2.5 text-sm font-medium text-cream shadow-sm transition-opacity hover:opacity-90 sm:self-auto"
        >
          + Add New Item
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-ink text-cream'
                : 'bg-white text-inksoft hover:bg-line/30 hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-inksoft">Loading your closet...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-inksoft">No items found in this category.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}