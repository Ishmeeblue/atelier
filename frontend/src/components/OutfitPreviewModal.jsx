import { useState, useEffect } from 'react';

export default function OutfitPreviewModal({ outfit, onClose, onDelete }) {
  const [positions, setPositions] = useState(() => {
    const initial = {};
    if (!outfit || !outfit.items) return initial;
    outfit.items.forEach((item, index) => {
      initial[item.id] = {
        x: (index % 2) * 260 + 20,
        y: Math.floor(index / 2) * 260 + 20,
      };
    });
    return initial;
  });

  // Track item scale multipliers (default is 1)
  const [scales, setScales] = useState(() => {
    const initial = {};
    if (outfit && outfit.items) {
      outfit.items.forEach((item) => {
        initial[item.id] = 1;
      });
    }
    return initial;
  });

  // Track z-index layers so the latest clicked/scrolled photo stays on top
  const [zIndices, setZIndices] = useState(() => {
    const initial = {};
    if (outfit && outfit.items) {
      outfit.items.forEach((item, index) => {
        initial[item.id] = index + 1;
      });
    }
    return initial;
  });

  const [maxZ, setMaxZ] = useState(outfit?.items?.length || 1);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Model states: Built-in Model 1.jpg enabled by default
  const [showModel, setShowModel] = useState(true);
  const [modelImage, setModelImage] = useState('/Model 1.jpg');

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

  useEffect(() => {
    return () => {
      if (modelImage && modelImage.startsWith('blob:')) {
        URL.revokeObjectURL(modelImage);
      }
    };
  }, [modelImage]);

  if (!outfit) return null;

  // Helper to bring an item to the top layer
  const bringToTop = (id) => {
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setZIndices((prev) => ({
      ...prev,
      [id]: nextZ,
    }));
  };

  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setDraggingId(id);
    bringToTop(id);

    const currentPos = positions[id] || { x: 20, y: 20 };
    setDragOffset({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  };

  // Handle mouse wheel scrolling to resize item
  const handleWheel = (e, id) => {
    e.preventDefault(); // Prevent page scrolling
    e.stopPropagation();
    bringToTop(id); // Bring to top layer when scaling

    setScales((prev) => {
      const currentScale = prev[id] || 1;
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const newScale = Math.min(Math.max(currentScale + delta, 0.4), 2.5); // Clamp between 40% and 250%
      return {
        ...prev,
        [id]: Number(newScale.toFixed(2)),
      };
    });
  };

  const handleModelPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setModelImage(objectUrl);
      setShowModel(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl font-body flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-line pb-3 gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{outfit.name}</h2>
            <p className="text-xs text-inksoft mt-0.5">
              Drag to move • Scroll wheel up/down to resize • Click to bring to top
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Model Photo Upload */}
            <label className="cursor-pointer rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-cream/50 flex items-center gap-1.5 shadow-sm">
              <span>📷 Change Model Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleModelPhotoUpload}
                className="hidden"
              />
            </label>

            {/* Model Toggle Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-md border border-line bg-cream/30 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-cream/60">
              <input
                type="checkbox"
                checked={showModel}
                onChange={(e) => setShowModel(e.target.checked)}
                className="h-4 w-4 rounded border-line text-wine focus:ring-wine/20 cursor-pointer"
              />
              <span>Show Model</span>
            </label>

            <button
              onClick={onClose}
              className="text-inksoft hover:text-ink text-lg font-bold p-1 ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Interactive Canvas Board */}
        <div className="relative my-4 h-[520px] w-full overflow-hidden rounded-lg border-2 border-dashed border-line bg-cream/10 select-none">
          <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider text-inksoft/60 pointer-events-none z-30">
            Outfit Canvas Board (Built-in Model Active)
          </div>

          {/* Model Background Layer */}
          {showModel && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                src={modelImage}
                alt="Built-in Model"
                className="h-[90%] w-auto object-contain opacity-90 drop-shadow-sm"
              />
            </div>
          )}

          {/* Draggable & Resizable Clothing Items */}
          {outfit.items?.map((item) => {
            const pos = positions[item.id] || { x: 20, y: 20 };
            const currentZ = zIndices[item.id] || 1;
            const currentScale = scales[item.id] || 1;

            return (
              <div
                key={item.id}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                onWheel={(e) => handleWheel(e, item.id)}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${currentScale})`,
                  zIndex: currentZ + 10,
                  transformOrigin: 'center center',
                }}
                className="absolute cursor-grab active:cursor-grabbing w-56 h-56 select-none transition-transform duration-75"
              >
                <img
                  src={item.image_path}
                  alt={item.name}
                  className="h-full w-full object-contain pointer-events-none drop-shadow-xl"
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