async function loadData() {
  const res = await fetch('./data.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load data.json');
  return await res.json();
}

function normalizeItem(item) {
  const path = item.path;
  const collection = path.startsWith('assets/podcasts') ? 'podcasts' : path.startsWith('assets/quizzes') ? 'quizzes' : 'other';
  const isAudio = path.toLowerCase().endsWith('.mp3');
  const isPdf = path.toLowerCase().endsWith('.pdf');
  const parts = path.split('/');
  // Extract category/subfolder name for podcasts (e.g., "Bedtime Stories")
  const category = collection === 'podcasts' && parts.length >= 3 ? parts[2] : (collection === 'quizzes' ? 'Quizzes' : 'Other');
  const title = parts[parts.length - 1].replace(/\.(mp3|pdf)$/i, '');
  const size = item.size || 0;
  return {
    title,
    category,
    collection,
    type: isAudio ? 'audio' : isPdf ? 'pdf' : 'other',
    path,
    size,
    url: `https://huggingface.co/datasets/SharedPL25/parentlab/resolve/main/${encodeURI(path)}`
  };
}

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

function render(items) {
  const grid = document.getElementById('grid');
  const count = document.getElementById('resultCount');
  grid.innerHTML = '';
  count.textContent = `${items.length} result${items.length === 1 ? '' : 's'}`;
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = it.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const chips = [it.collection, it.category, it.type.toUpperCase(), formatSize(it.size)].filter(Boolean);
    for (const c of chips) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = c;
      meta.appendChild(chip);
    }
    const row = document.createElement('div');
    row.className = 'row';
    row.textContent = it.path;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const aView = document.createElement('a');
    aView.className = 'btn';
    if (it.type === 'audio') {
      const qs = new URLSearchParams({
        src: it.url,
        title: it.title,
        category: it.category,
      }).toString();
      aView.href = `./play.html?${qs}`;
      aView.textContent = 'Play';
    } else {
      aView.href = it.url;
      aView.target = '_blank';
      aView.rel = 'noopener noreferrer';
      aView.textContent = 'Open PDF';
    }
    actions.appendChild(aView);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(row);
    card.appendChild(actions);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function setupSearch(items) {
  const fuse = new Fuse(items, {
    keys: ['title', 'category', 'collection', 'type', 'path'],
    threshold: 0.35,
    distance: 200,
    ignoreLocation: true,
  });
  const input = document.getElementById('searchInput');
  const sel = document.getElementById('collectionFilter');
  const chkAudio = document.getElementById('typeAudio');
  const chkPdf = document.getElementById('typePdf');
  const apply = () => {
    const q = input.value.trim();
    const selectedCollection = sel.value;
    const allowedTypes = new Set();
    if (chkAudio.checked) allowedTypes.add('audio');
    if (chkPdf.checked) allowedTypes.add('pdf');
    let results = q ? fuse.search(q).map(r => r.item) : items.slice();
    if (selectedCollection) results = results.filter(r => r.collection === selectedCollection);
    results = results.filter(r => allowedTypes.has(r.type));
    render(results);
  };
  input.addEventListener('input', apply);
  sel.addEventListener('change', apply);
  chkAudio.addEventListener('change', apply);
  chkPdf.addEventListener('change', apply);
  apply();
}

(async function init() {
  try {
    const raw = await loadData();
    const items = raw
      .filter(x => x.path && (x.path.toLowerCase().endsWith('.mp3') || x.path.toLowerCase().endsWith('.pdf')))
      .map(normalizeItem);
    setupSearch(items);
  } catch (e) {
    const grid = document.getElementById('grid');
    grid.innerHTML = `<div class="card">Failed to load data: ${e}</div>`;
  }
})();


