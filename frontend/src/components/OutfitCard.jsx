export default function OutfitCard({ outfit, onClick, onDelete }) {
  const items = outfit.items || [];

  // Determine grid layout based on piece count
  const getGridColsClass = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div
      onClick={() => onClick(outfit)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-md border border-line bg-white p-3 shadow-sm transition-all hover:shadow-md"
    >
      {/* Flat-Lay Collage Grid */}
      <div
        className={`grid aspect-square w-full gap-1.5 overflow-hidden rounded bg-cream/30 p-2 ${getGridColsClass(
          items.length
        )}`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="relative h-full w-full overflow-hidden rounded bg-white"
          >
            <img
              src={item.image_path}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Outfit Info */}
      <div className="mt-3 flex items-center justify-between">
        <h3 className="truncate font-display text-base font-medium text-ink">
          {outfit.name}
        </h3>
        <span className="font-body text-xs text-inksoft">
          {items.length} {items.length === 1 ? 'piece' : 'pieces'}
        </span>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents opening the preview modal when clicking delete
          onDelete(outfit.id);
        }}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-wine opacity-0 shadow-sm transition-opacity hover:bg-wine hover:text-cream group-hover:opacity-100"
        title="Delete Outfit"
      >
        ✕
      </button>
    </div>
  );
}