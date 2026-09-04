import { useState, useEffect } from 'react';
import { fetchOutfits, deleteOutfit, fetchItems, createOutfit } from '../services/api';
import AddOutfitModal from '../components/AddOutfitModal';

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [closetItems, setClosetItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedOutfits, fetchedItems] = await Promise.all([
          fetchOutfits(),
          fetchItems(),
        ]);
        setOutfits(fetchedOutfits);
        setClosetItems(fetchedItems);
      } catch (err) {
        console.error('Failed to load outfits data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddOutfit = async (outfitData) => {
    setIsLoading(true);
    await createOutfit(outfitData);
    try {
      const [fetchedOutfits, fetchedItems] = await Promise.all([
        fetchOutfits(),
        fetchItems(),
      ]);
      setOutfits(fetchedOutfits);
      setClosetItems(fetchedItems);
    } catch (err) {
      console.error('Failed to reload outfits data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOutfit = async (id) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((outfit) => Number(outfit.id) !== Number(id)));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 font-body">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Your Outfits</h1>
          <p className="mt-1 text-sm text-inksoft">
            Mix and match your closet items into ready-to-wear looks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start rounded-md bg-wine px-5 py-2.5 text-sm font-medium text-cream shadow-sm transition-opacity hover:opacity-90 sm:self-auto"
        >
          + Create Outfit
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-inksoft">Loading your outfits...</div>
      ) : outfits.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-inksoft">No outfits created yet.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="group relative flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm">
              <div className="border-b border-line bg-cream/30 p-4">
                <h3 className="font-display text-lg font-medium text-ink">{outfit.name}</h3>
                <p className="text-xs text-inksoft">{outfit.items?.length || 0} items</p>
              </div>
              
              <div className="flex flex-wrap gap-2 p-4">
                {outfit.items?.map((item) => (
                  <div key={item.id} className="h-20 w-16 overflow-hidden rounded border border-line">
                    <img src={item.image_path} alt={item.name} className="h-full w-full object-cover" title={item.name} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDeleteOutfit(outfit.id)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-wine opacity-0 shadow-sm transition-opacity hover:bg-wine hover:text-cream group-hover:opacity-100"
                title="Delete Outfit"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <AddOutfitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddOutfit}
        closetItems={closetItems}
      />
    </div>
  );
}