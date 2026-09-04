export default function ItemCard({ item, onDelete }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-cream/50">
        <img
          src={item.image_path}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info Container */}
      <div className="flex flex-col justify-between p-3">
        <span className="text-xs font-medium uppercase tracking-wider text-inksoft">
          {item.category}
          {item.subcategory ? ` · ${item.subcategory}` : ''}
        </span>
        <h3 className="truncate font-display text-base font-medium text-ink">
          {item.name}
        </h3>
      </div>

      {/* Delete Button (Appears on Hover) */}
      <button
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-wine opacity-0 shadow-sm transition-opacity hover:bg-wine hover:text-cream group-hover:opacity-100"
        title="Delete Item"
      >
        ✕
      </button>
    </div>
  );
}