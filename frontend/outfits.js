const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];

let items = [];
let outfits = [];
let builderSelected = [];

async function loadItems() {
  const res = await fetch('/api/items');
  items = await res.json();
}

// ---------- SHARED COLLAGE RENDERER ----------

function renderCollageHTML(itemsArr) {
  if (itemsArr.length === 0) {
    return '<span class="text-xs text-inksoft">Tap pieces to add them here</span>';
  }
  const cols = itemsArr.length <= 1 ? 1 : itemsArr.length <= 4 ? 2 : 3;
  const cells = itemsArr.map((it) => `
    <div class="bg-white rounded-lg border border-line flex items-center justify-center p-2 aspect-square">
      <img src="${it.image_path}" alt="${it.name}" class="max-w-full max-h-full object-contain" />
    </div>
  `).join('');
  return `<div class="grid gap-2 w-full" style="grid-template-columns: repeat(${cols}, 1fr);">${cells}</div>`;
}

// ---------- OUTFITS LIST ----------

const outfitsListView = document.getElementById('outfits-list-view');
const builderView = document.getElementById('builder-view');
const outfitsGrid = document.getElementById('outfits-grid');

async function loadOutfits() {
  const res = await fetch('/api/outfits');
  outfits = await res.json();
  renderOutfits();
}

function renderOutfits() {
  outfitsGrid.innerHTML = '';
  outfits.forEach((outfit) => outfitsGrid.appendChild(createOutfitCard(outfit)));
}

function createOutfitCard(outfit) {
  const card = document.createElement('div');
  card.className = 'bg-white border border-line rounded-xl p-3 cursor-pointer hover:border-wine transition-colors';

  card.innerHTML = `
    <div class="mb-2">${renderCollageHTML(outfit.items)}</div>
    <div class="font-display text-sm">${outfit.name}</div>
    <div class="flex items-center justify-between text-xs text-inksoft mt-1">
      <span>${outfit.items.length} piece${outfit.items.length === 1 ? '' : 's'}</span>
      <button class="delete-outfit-btn hover:text-wine">&times;</button>
    </div>
  `;

  card.addEventListener('click', () => openOutfitPreview(outfit));

  card.querySelector('.delete-outfit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteOutfit(outfit.id);
  });

  return card;
}

async function deleteOutfit(id) {
  await fetch(`/api/outfits/${id}`, { method: 'DELETE' });
  previewModal.classList.add('hidden');
  loadOutfits();
}

// ---------- OUTFIT PREVIEW MODAL ----------

const previewModal = document.getElementById('outfit-preview-modal');
const previewName = document.getElementById('preview-name');
const previewCollage = document.getElementById('preview-collage');
const previewDeleteBtn = document.getElementById('preview-delete-btn');
let currentPreviewOutfitId = null;

function openOutfitPreview(outfit) {
  currentPreviewOutfitId = outfit.id;
  previewName.textContent = outfit.name;
  previewCollage.innerHTML = renderCollageHTML(outfit.items);
  previewModal.classList.remove('hidden');
}

document.getElementById('close-preview').addEventListener('click', () => {
  previewModal.classList.add('hidden');
});

previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) previewModal.classList.add('hidden');
});

previewDeleteBtn.addEventListener('click', () => {
  deleteOutfit(currentPreviewOutfitId);
});

// ---------- OUTFIT BUILDER ----------

document.getElementById('open-builder').addEventListener('click', async () => {
  builderSelected = [];
  document.getElementById('outfit-name').value = '';
  await loadItems();
  outfitsListView.classList.add('hidden');
  builderView.classList.remove('hidden');
  renderBuilderPicker();
  renderBuilderBoard();
});

document.getElementById('back-to-outfits').addEventListener('click', () => {
  builderView.classList.add('hidden');
  outfitsListView.classList.remove('hidden');
});

function renderBuilderPicker() {
  const picker = document.getElementById('builder-picker');
  picker.innerHTML = '';

  CATEGORIES.forEach((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length === 0) return;

    const section = document.createElement('div');
    section.className = 'mb-4';
    section.innerHTML = `<h4 class="text-xs italic text-inksoft mb-2">${cat}</h4>`;

    const row = document.createElement('div');
    row.className = 'flex flex-wrap gap-2';

    catItems.forEach((item) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      const isSelected = builderSelected.includes(item.id);
      thumb.className = `w-16 h-16 rounded-lg overflow-hidden border-2 bg-white flex items-center justify-center ${isSelected ? 'border-wine' : 'border-line'}`;
      thumb.innerHTML = `<img src="${item.image_path}" class="max-w-full max-h-full object-contain" />`;
      thumb.addEventListener('click', () => toggleBuilderItem(item.id));
      row.appendChild(thumb);
    });

    section.appendChild(row);
    picker.appendChild(section);
  });
}

function toggleBuilderItem(id) {
  builderSelected = builderSelected.includes(id)
    ? builderSelected.filter((x) => x !== id)
    : [...builderSelected, id];
  renderBuilderPicker();
  renderBuilderBoard();
}

function renderBuilderBoard() {
  const collage = document.getElementById('board-collage');
  const list = document.getElementById('board-list');
  const saveBtn = document.getElementById('save-outfit');

  const selectedItems = builderSelected.map((id) => items.find((i) => i.id === id)).filter(Boolean);

  collage.innerHTML = renderCollageHTML(selectedItems);

  list.innerHTML = selectedItems.map((it) => `
    <li class="flex items-center justify-between bg-cream rounded-lg px-2 py-1">
      <span>${it.name}</span>
      <button data-id="${it.id}" class="remove-from-board text-inksoft hover:text-wine">&times;</button>
    </li>
  `).join('');

  list.querySelectorAll('.remove-from-board').forEach((btn) => {
    btn.addEventListener('click', () => toggleBuilderItem(Number(btn.dataset.id)));
  });

  saveBtn.disabled = selectedItems.length === 0;
}

document.getElementById('save-outfit').addEventListener('click', async () => {
  const name = document.getElementById('outfit-name').value.trim() || 'Untitled outfit';

  const res = await fetch('/api/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, itemIds: builderSelected }),
  });

  if (!res.ok) return;

  builderView.classList.add('hidden');
  outfitsListView.classList.remove('hidden');
  loadOutfits();
});

loadOutfits();