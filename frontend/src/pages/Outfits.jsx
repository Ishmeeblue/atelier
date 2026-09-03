import { useState, useEffect } from 'react';
import OutfitCard from '../components/OutfitCard';
import OutfitBuilder from '../components/OutfitBuilder';
import OutfitPreviewModal from '../components/OutfitPreviewModal';
import { fetchOutfits, fetchItems, createOutfit, deleteOutfit } from '../services/api';

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [outfitsData, itemsData] = await Promise.all([
        fetchOutfits(),
        fetchItems(),
      ]);
      setOutfits(outfitsData);
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to load outfits data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveOutfit = async (outfitData) => {
    const newOutfit = await createOutfit(outfitData);
    // Reload full list to ensure nested items are returned properly from the DB
    const updatedOutfits = await fetchOutfits();
    setOutfits(updatedOutfits);
  };

  const handleDeleteOutfit = async (id) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => Number(o.id) !== Number(id)));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 font-body">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Outfits</h1>
          <p className="mt-1 text-sm text-inksoft">
            View your curated looks and mix-and-match pieces.
          </p>
        </div>
        <button
          onClick={() => setIsBuilderOpen(true)}
          className="self-start rounded-md bg-wine px-5 py-2.5 text-sm font-medium text-cream shadow-sm transition-opacity hover:opacity-90 sm:self-auto"
        >
          + Create New Outfit
        </button>
      </div>

      {/* Outfits Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-inksoft">Loading your outfits...</div>
      ) : outfits.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-inksoft">No outfits created yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onClick={(o) => setSelectedOutfit(o)}
              onDelete={handleDeleteOutfit}
            />
          ))}
        </div>
      )}

      {/* Outfit Builder Modal */}
      <OutfitBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        items={items}
        onSave={handleSaveOutfit}
      />

      {/* Outfit Preview Modal */}
      <OutfitPreviewModal
        isOpen={Boolean(selectedOutfit)}
        onClose={() => setSelectedOutfit(null)}
        outfit={selectedOutfit}
      />
    </div>
  );
}