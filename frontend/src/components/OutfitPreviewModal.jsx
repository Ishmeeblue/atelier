import { useState, useEffect } from 'react';

export default function OutfitPreviewModal({ outfit, onClose, onDelete }) {
  // 1. Hooks are called unconditionally at the very top
  const [positions, setPositions] = useState(() => {
    const initial = {};
    if (!outfit || !outfit.items) return initial;
    outfit.items.forEach((item, index) => {
      initial[item.id] = {
        x: (index % 3) * 110 + 30,
        y: Math.floor(index / 3) * 110 + 30,
      };
    });
    return initial;
  });

  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle global mouse movement and release so dragging doesn't get stuck
  useEffect(() => {
    if (draggingId === null) return;

    const handleMouseMove = (e) => {
      setPositions((prev) => ({
        ...prev,
        [draggingId]: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  // 2. Early return comes AFTER all hooks have executed
  if (!outfit) return null;

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setDraggingId(id);
    const currentPos = positions[id] || { x: 30, y: 30 };
    setDragOffset({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl font-body flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{outfit.name}</h2>
            <p className="text-xs text-inksoft mt-0.5">
              Drag and arrange the clothing items freely inside the canvas below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-inksoft hover:text-ink text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Interactive Canvas Board */}
        <div className="relative my-4 h-96 w-full overflow-hidden rounded-lg border-2 border-dashed border-line bg-cream/10 select-none">
          <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider text-inksoft/60 pointer-events-none">
            Outfit Canvas Board (Click & Drag pictures)
          </div>

          {outfit.items?.map((item) => {
            const pos = positions[item.id] || { x: 30, y: 30 };
            return (
              <div
                key={item.id}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: draggingId === item.id ? 50 : 10,
                }}
                className="absolute cursor-grab active:cursor-grabbing w-28 h-28 select-none"
              >
                <img
                  src={item.image_path}
                  alt={item.name}
                  className="h-full w-full object-contain pointer-events-none drop-shadow-md transition-transform hover:scale-105"
                />
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete outfit "${outfit.name}"?`)) {
                onDelete(outfit.id);
                onClose();
              }
            }}
            className="rounded-md border border-red-300 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete Outfit
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-wine px-4 py-2 text-xs font-medium text-cream hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}