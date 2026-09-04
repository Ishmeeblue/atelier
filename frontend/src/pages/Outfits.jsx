import { useState, useEffect } from 'react';
import { fetchOutfits, deleteOutfit, fetchItems, createOutfit } from '../services/api';
import AddOutfitModal from '../components/AddOutfitModal';
import OutfitPreviewModal from '../components/OutfitPreviewModal';

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewOutfit, setPreviewOutfit] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const [outfitsData, itemsData] = await Promise.all([
        fetchOutfits(),
        fetchItems(),
      ]);
      setOutfits(outfitsData);
      setItems(itemsData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load outfits');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleOpenAddModal = async () => {
    try {
      const itemsData = await fetchItems();
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to refresh items list', err);
    }
    setIsAddModalOpen(true);
  };

  const handleCreateOutfit = async (outfitData) => {
    await createOutfit(outfitData);
    loadData();
  };

  const handleDeleteOutfit = async (id) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      if (previewOutfit && previewOutfit.id === id) {
        setPreviewOutfit(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete outfit');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">My Outfits</h1>
          <p className="text-sm text-inksoft mt-1">Combine your closet items into signature looks</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center rounded-md bg-wine px-4 py-2.5 text-xs font-medium text-cream shadow-sm hover:opacity-90 transition-opacity"
        >
          + Create Outfit
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 text-center text-sm text-inksoft">Loading your outfits...</div>
      ) : outfits.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-12 text-center">
          <p className="text-sm text-inksoft">No outfits created yet.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 rounded-md bg-wine/10 px-4 py-2 text-xs font-medium text-wine hover:bg-wine/20"
          >
            Create your first outfit
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              onClick={() => setPreviewOutfit(outfit)}
              className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm transition-all hover:shadow-md cursor-pointer p-4"
            >
              <div className="flex items-center justify-between border-b border-line/50 pb-3">
                <h3 className="font-display text-base font-semibold text-ink truncate">
                  {outfit.name}
                </h3>
                <span className="text-xs text-inksoft bg-line/20 px-2 py-0.5 rounded-full">
                  {outfit.items?.length || 0} items
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {outfit.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="aspect-square overflow-hidden rounded bg-cream/20 border border-line/40">
                    <img src={item.image_path} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                ))}
                {outfit.items?.length > 3 && (
                  <div className="flex items-center justify-center rounded bg-cream/40 border border-line/40 text-xs font-medium text-inksoft">
                    +{outfit.items.length - 3} more
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 text-xs text-inksoft">
                <span>Created {new Date(outfit.created_at).toLocaleDateString()}</span>
                <span className="text-wine font-medium group-hover:underline">Open Canvas →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddOutfitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateOutfit}
        items={items}
      />

      <OutfitPreviewModal
        key={previewOutfit?.id}
        outfit={previewOutfit}
        onClose={() => setPreviewOutfit(null)}
        onDelete={handleDeleteOutfit}
      />
    </div>
  );
}