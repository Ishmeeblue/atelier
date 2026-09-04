import { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import { fetchItems, createItem, deleteItem } from '../services/api';
import { CATEGORIES, SUBCATEGORIES } from '../constants/categories';

const FILTER_CATEGORIES = ['All', ...CATEGORIES];

export default function Closet() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems();
        console.log('Fetched items structure:', data);
        setItems(data);
      } catch (err) {
        console.error('Failed to load clothing items:', err);
      } finally {
        setIsLoading(false);
      }
    };

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

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  // Case-insensitive filtering supporting both subcategory and sub_category database keys
  const filteredItems = items.filter((item) => {
    const itemCat = (item.category || '').trim().toLowerCase();
    const itemSub = (item.subcategory || item.sub_category || '').trim().toLowerCase();

    const targetCat = selectedCategory.trim().toLowerCase();
    const targetSub = selectedSubcategory.trim().toLowerCase();

    const matchCategory = selectedCategory === 'All' || itemCat === targetCat;
    const matchSubcategory = selectedSubcategory === 'All' || itemSub === targetSub;

    return matchCategory && matchSubcategory;
  });

  const isGrouped = selectedCategory !== 'All' && selectedSubcategory === 'All';
  let groupedSections = [];

  if (isGrouped) {
    const subcats = SUBCATEGORIES[selectedCategory] || [];
    groupedSections = subcats
      .map((sub) => ({
        label: sub,
        items: filteredItems.filter((item) => {
          const itemSub = (item.subcategory || item.sub_category || '').trim().toLowerCase();
          return itemSub === sub.trim().toLowerCase();
        }),
      }))
      .filter((section) => section.items.length > 0);

    const unsorted = filteredItems.filter((item) => {
      const itemSub = (item.subcategory || item.sub_category || '').trim().toLowerCase();
      return !itemSub || !subcats.some((s) => s.trim().toLowerCase() === itemSub);
    });

    if (unsorted.length > 0) {
      groupedSections.push({ label: 'Unsorted', items: unsorted });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 font-body">
      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Welcome to Your Closet!</h1>
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

      {/* Main Category Filter Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
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

      {/* Subcategory (Type) Filter Tabs */}
      {selectedCategory !== 'All' && (
        <div className="mt-4 flex flex-wrap gap-2 border-b border-line pb-4">
          <button
            onClick={() => setSelectedSubcategory('All')}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedSubcategory === 'All'
                ? 'bg-inksoft border-inksoft text-cream'
                : 'bg-white border-line text-inksoft hover:bg-line/20 hover:text-ink'
            }`}
          >
            All {selectedCategory}
          </button>
          {SUBCATEGORIES[selectedCategory]?.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-inksoft border-inksoft text-cream'
                  : 'bg-white border-line text-inksoft hover:bg-line/20 hover:text-ink'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-inksoft">Loading your closet...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-inksoft">No items found in this category.</p>
        </div>
      ) : isGrouped ? (
        <div className="mt-8 space-y-8">
          {groupedSections.map((section) => (
            <div key={section.label}>
              <h2 className="font-display italic text-sm text-inksoft border-b border-line pb-1 mb-3">
                {section.label}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {section.items.map((item) => (
                  <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
                ))}
              </div>
            </div>
          ))}
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