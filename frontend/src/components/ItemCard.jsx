export default function ItemCard({ item, onDelete, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      {/* Item Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream/20">
        <img
          src={item.image_path}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Delete Button (stops propagation so clicking delete doesn't open the preview) */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 text-inksoft shadow hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete item"
          >
            ✕
          </button>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-col p-3 font-body">
        <span className="text-xs font-medium text-wine uppercase tracking-wider">
          {item.category}
        </span>
        <h3 className="font-display text-sm font-semibold text-ink truncate mt-0.5">
          {item.name}
        </h3>
        <span className="text-xs text-inksoft truncate mt-0.5">
          {item.subcategory || 'Unsorted'}
        </span>
      </div>
    </div>
  );
}