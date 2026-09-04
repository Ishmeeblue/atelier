// frontend/src/services/api.js

// Clothes Items API Calls

export async function fetchItems() {
  const res = await fetch('/api/items');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch items');
  }
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch('/api/items', {
    method: 'POST',
    body: formData, // Note: Do not set Content-Type header manually when using FormData
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add clothing item');
  }
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete item');
  }
  
  // Safely parse JSON only if the backend sends a body back
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// Outfits API Calls

export async function fetchOutfits() {
  const res = await fetch('/api/outfits');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch outfits');
  }
  return res.json();
}

export async function createOutfit(outfitData) {
  const res = await fetch('/api/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outfitData),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save outfit');
  }
  return res.json();
}

export async function deleteOutfit(id) {
  const res = await fetch(`/api/outfits/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete outfit');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}