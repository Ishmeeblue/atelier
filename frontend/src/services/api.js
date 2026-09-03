// Items API
export async function fetchItems() {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch('/api/items', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add clothing item');
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete item');
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// Outfits API
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
  const res = await fetch(`/api/outfits/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete outfit');
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// Profile API
export async function fetchProfile() {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function uploadProfilePhoto(formData) {
  const res = await fetch('/api/profile', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload profile photo');
  return res.json();
}

// Dress Me AI API
export async function generateDressMe(outfitId) {
  const res = await fetch('/api/dress-me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outfitId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate virtual try-on');
  return data;
}