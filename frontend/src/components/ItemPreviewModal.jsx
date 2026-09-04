export default function ItemPreviewModal({ item, onClose, onDelete }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl font-body">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-display text-lg font-semibold text-ink">Item Preview</h2>
          <button
            onClick={onClose}
            className="text-inksoft hover:text-ink text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="relative h-64 w-full overflow-hidden rounded-md border border-line bg-cream/20 flex items-center justify-center">
            <img 
              src={item.image_path} 
              alt={item.name} 
              className="h-full w-full object-contain" 
            />
          </div>
          
          <h3 className="mt-4 font-display text-lg font-medium text-ink text-center">
            {item.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-wine/10 px-2.5 py-1 text-xs font-medium text-wine">
              {item.category}
            </span>
            <span className="rounded-md bg-line/30 px-2.5 py-1 text-xs font-medium text-inksoft">
              {item.subcategory || 'Unsorted'}
            </span>
          </div>

          {item.created_at && (
            <p className="mt-3 text-xs text-inksoft">
              Added on: {new Date(item.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                onDelete(item.id);
                onClose();
              }
            }}
            className="rounded-md border border-red-300 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete Item
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-wine px-4 py-2 text-xs font-medium text-cream hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}