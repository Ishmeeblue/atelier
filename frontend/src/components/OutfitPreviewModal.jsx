import { useState, useEffect } from 'react';
import { generateDressMe } from '../services/api';

export default function OutfitPreviewModal({ isOpen, onClose, outfit }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnImage, setTryOnImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setTryOnImage(null);
      setErrorMsg(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  if (!isOpen || !outfit) return null;

  const items = outfit.items || [];

  const handleDressMe = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const result = await generateDressMe(outfit.id);
      setTryOnImage(result.result_image);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-line bg-cream shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-6 bg-white">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">{outfit.name}</h2>
            <p className="text-xs text-inksoft mt-1">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'} in this look
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-inksoft transition-colors hover:text-wine font-medium text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="rounded-md border border-wine/30 bg-wine/10 p-3 text-xs text-wine">
              {errorMsg}
            </div>
          )}

          <div className={`grid gap-6 ${tryOnImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Items Grid */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-inksoft mb-3">
                Outfit Items
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-cream/30">
                      <img
                        src={item.image_path}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-inksoft">
                        {item.category}
                      </span>
                      <h4 className="truncate font-display text-xs font-medium text-ink">
                        {item.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Result Section */}
            {tryOnImage && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-inksoft mb-3">
                  Virtual Try-On Result
                </h3>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-line bg-white shadow-sm flex items-center justify-center">
                  <img
                    src={tryOnImage}
                    alt="Virtual Try-On"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line p-4 bg-white">
          <button
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-inksoft transition-colors hover:bg-line/20"
          >
            Close
          </button>

          <button
            onClick={handleDressMe}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-md bg-wine px-5 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
                Styling...
              </>
            ) : (
              '✨ Dress Me'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}