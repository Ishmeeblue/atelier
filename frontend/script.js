const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];

let items = [];
let outfits = [];
let builderSelected = [];

// ---------- CLOSET ----------

async function loadItems() {
  const res = await fetch('/api/items');
  items = await res.json();
  renderItems();
}

function renderItems() {
  CATEGORIES.forEach((cat) => {
    document.querySelector(`.category[data-category="${cat}"] .items`).innerHTML = '';
  });
  items.forEach((item) => {
    const container = document.querySelector(`.category[data-category="${item.category}"] .items`);
    if (container) container.appendChild(createItemCard(item));
  });
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'flex-shrink-0 w-28';
  card.innerHTML = `
    <div class="w-28 h-28 rounded-lg overflow-hidden border border-line bg-white">
      <img src="${item.image_path}" alt="${item.name}" class="w-full h-full object-cover" />
    </div>
    <div class="flex items-center justify-between mt-1 text-xs">
      <span class="truncate">${item.name}</span>
      <button class="delete-btn text-inksoft hover:text-wine px-1">&times;</button>
    </div>
  `;
  card.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.id));
  return card;
}

async function deleteItem(id) {
  await fetch(`/api/items/${id}`, { method: 'DELETE' });
  loadItems();
}

// ---------- TABS ----------

const tabClosetBtn = document.getElementById('tab-closet');
const tabOutfitsBtn = document.getElementById('tab-outfits');
const viewCloset = document.getElementById('view-closet');
const viewOutfits = document.getElementById('view-outfits');

tabClosetBtn.addEventListener('click', () => {
  viewCloset.classList.remove('hidden');
  viewOutfits.classList.add('hidden');
  tabClosetBtn.classList.add('bg-ink', 'text-cream');
  tabClosetBtn.classList.remove('text-inksoft');
  tabOutfitsBtn.classList.remove('bg-ink', 'text-cream');
  tabOutfitsBtn.classList.add('text-inksoft');
});

tabOutfitsBtn.addEventListener('click', () => {
  viewOutfits.classList.remove('hidden');
  viewCloset.classList.add('hidden');
  tabOutfitsBtn.classList.add('bg-ink', 'text-cream');
  tabOutfitsBtn.classList.remove('text-inksoft');
  tabClosetBtn.classList.remove('bg-ink', 'text-cream');
  tabClosetBtn.classList.add('text-inksoft');
  loadOutfits();
});

// ---------- ADD ITEM MODAL ----------

const addModal = document.getElementById('add-modal');
const addForm = document.getElementById('add-form');
const photoInput = document.getElementById('photo-input');
const photoPreviewBox = document.getElementById('photo-preview-box');
const addError = document.getElementById('add-error');

document.getElementById('open-add-modal').addEventListener('click', () => {
  addForm.reset();
  photoPreviewBox.innerHTML = 'Choose a photo';
  addError.classList.add('hidden');
  addModal.classList.remove('hidden');
});

document.getElementById('close-add-modal').addEventListener('click', () => addModal.classList.add('hidden'));
document.getElementById('cancel-add').addEventListener('click', () => addModal.classList.add('hidden'));

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  photoPreviewBox.innerHTML = `<img src="${url}" class="w-full h-full object-cover" />`;
});

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  addError.classList.add('hidden');

  const name = document.getElementById('name-input').value.trim();
  const category = document.getElementById('category-input').value;
  const file = photoInput.files[0];

  if (!name || !file) {
    addError.textContent = 'A photo and a name are both required.';
    addError.classList.remove('hidden');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('photo', file);

  const res = await fetch('/api/items', { method: 'POST', body: formData });

  if (!res.ok) {
    addError.textContent = 'Something went wrong saving that piece.';
    addError.classList.remove('hidden');
    return;
  }

  addModal.classList.add('hidden');
  loadItems();
});

// ---------- OUTFITS ----------

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
  card.className = 'bg-white border border-line rounded-xl p-3';

  const imagesHtml = outfit.items.slice(0, 4).map((it, idx) => `
    <img src="${it.image_path}" class="absolute w-14 h-14 object-cover rounded-lg border-2 border-white shadow"
      style="transform: rotate(${(idx % 2 === 0 ? -1 : 1) * (3 + idx * 2)}deg) translate(${idx * 8}px, ${idx * 5}px); z-index:${idx};" />
  `).join('');

  card.innerHTML = `
    <div class="relative h-28 flex items-center justify-center mb-2">${imagesHtml}</div>
    <div class="font-display text-sm">${outfit.name}</div>
    <div class="flex items-center justify-between text-xs text-inksoft mt-1">
      <span>${outfit.items.length} piece${outfit.items.length === 1 ? '' : 's'}</span>
      <button class="delete-outfit-btn hover:text-wine">&times;</button>
    </div>
  `;

  card.querySelector('.delete-outfit-btn').addEventListener('click', () => deleteOutfit(outfit.id));
  return card;
}

async function deleteOutfit(id) {
  await fetch(`/api/outfits/${id}`, { method: 'DELETE' });
  loadOutfits();
}

// ---------- OUTFIT BUILDER ----------

document.getElementById('open-builder').addEventListener('click', () => {
  builderSelected = [];
  document.getElementById('outfit-name').value = '';
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
      thumb.className = `w-16 h-16 rounded-lg overflow-hidden border-2 ${isSelected ? 'border-wine' : 'border-line'}`;
      thumb.innerHTML = `<img src="${item.image_path}" class="w-full h-full object-cover" />`;
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

  collage.innerHTML = selectedItems.length === 0
    ? '<span class="text-xs text-inksoft">Tap pieces to add them here</span>'
    : selectedItems.map((it, idx) => `
        <img src="${it.image_path}" class="absolute w-20 h-20 object-cover rounded-lg border-2 border-white shadow"
          style="transform: rotate(${(idx % 2 === 0 ? -1 : 1) * (3 + idx * 2)}deg) translate(${idx * 10}px, ${idx * 6}px); z-index:${idx};" />
      `).join('');

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

// ---------- INIT ----------

loadItems();