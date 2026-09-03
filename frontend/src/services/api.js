// Clothes Items API Calls

export async function fetchItems() {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch('/api/items', {
    method: 'POST',
    body: formData, // FormData includes image file and fields automatically
  });
  if (!res.ok) throw new Error('Failed to add clothing item');
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
}

// Outfits API Calls

export async function fetchOutfits() {
  const res = await fetch('/api/outfits');
  if (!res.ok) throw new Error('Failed to fetch outfits');
  return res.json();
}

export async function createOutfit(outfitData) {
  const res = await fetch('/api/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outfitData),
  });
  if (!res.ok) throw new Error('Failed to save outfit');
  return res.json();
}

export async function deleteOutfit(id) {
  const res = await fetch(`/api/outfits/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete outfit');
  return res.json();
}