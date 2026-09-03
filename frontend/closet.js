const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];

let items = [];

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

loadItems();