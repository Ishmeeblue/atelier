export default function OutfitPreviewModal({ isOpen, onClose, outfit }) {
  if (!isOpen || !outfit) return null;

  const items = outfit.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-line bg-cream shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-6 bg-white">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">{outfit.name}</h2>
            <p className="text-xs text-inksoft mt-1">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'} in this styled look
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                <div className="p-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-inksoft">
                    {item.category}
                  </span>
                  <h4 className="truncate font-display text-sm font-medium text-ink">
                    {item.name}
                  </h4>
                </div>
              </div>
            ))}
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
          
          {/* Placeholder for future Dress Me AI feature */}
          <button
            disabled
            title="Dress Me AI Virtual Try-On (Coming Soon)"
            className="rounded-md bg-wine/40 px-5 py-2 text-sm font-medium text-cream cursor-not-allowed"
          >
            ✨ Dress Me (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}