const STORAGE_KEY = 'vigil-memory-archive-v1';
const ENGINE_KEY = 'vigil-reflection-engine-v1';
const DB_NAME = 'vigil-local-archive';
const DB_VERSION = 1;
const DB_STORE = 'state';
const MAX_MEMORIES = 5000;
const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
const MAX_ARCHIVE_CHARS = 8 * 1024 * 1024;
const MAX_TITLE = 120;
const MAX_PERSON = 100;
const MAX_DATE = 80;
const MAX_PLACE = 160;
const MAX_BODY = 20_000;
const MAX_TAGS = 30;
const MAX_TAG = 40;

const seedMemories = [
  { id: 'seed-radio', title: 'The orange radio', person: 'Abuela Elena', date: 'Summer, 1998', place: 'Her kitchen in Oaxaca', body: 'Every Sunday, Abuela Elena tuned the orange radio to the station that played boleros. She cooked slowly, with one hip against the counter, and sang only the parts she remembered. The whole kitchen smelled of cinnamon, warm corn, and the orange peel she kept beside the stove. When the signal faded, she would tap the radio twice and say, “Stay with us.”', tags: ['music', 'kitchen', 'voice'], createdAt: '1998-06-01T10:00:00.000Z' },
  { id: 'seed-marbles', title: 'Three blue marbles', person: 'Milo', date: 'A Tuesday in 2004', place: 'The back steps', body: 'Milo kept three blue marbles in the pocket of his school uniform. He said they were planets, and that the smallest one was where he would live when he grew up. In the afternoon sun they looked almost silver. He gave me the middle planet before he left, but I never learned what he named it.', tags: ['childhood', 'blue', 'summer'], createdAt: '2004-08-17T10:00:00.000Z' },
  { id: 'seed-recipe', title: 'The recipe with no measurements', person: 'Papá Tomás', date: 'Undated', place: 'A notebook by the window', body: 'Papá Tomás wrote recipes by instinct: a little salt, enough heat, until it smells right. His handwriting leaned forward as if it were always in a hurry to get to the good part. The page for the sweet bread has one flour thumbprint in the margin. It is the only measurement I trust.', tags: ['recipe', 'hands', 'home'], createdAt: '2001-01-01T10:00:00.000Z' }
];

const state = { memories: seedMemories, engine: 'fallback', query: '', filter: 'all', selectedMemory: null, echo: null, storage: 'browser', echoRequest: null, echoRequestId: 0 };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const makeId = () => globalThis.crypto?.randomUUID?.() || `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function text(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }

function normaliseMemory(value, id = makeId()) {
  if (!value || typeof value !== 'object') return null;
  const title = text(value.title, MAX_TITLE);
  const person = text(value.person, MAX_PERSON);
  const body = text(value.body, MAX_BODY);
  if (!title || !person || !body) return null;
  const rawTags = Array.isArray(value.tags) ? value.tags : [];
  return {
    id: text(value.id, 120) || id,
    title,
    person,
    date: text(value.date, MAX_DATE) || 'Undated',
    place: text(value.place, MAX_PLACE),
    body,
    tags: [...new Set(rawTags.map((tag) => text(tag, MAX_TAG).toLowerCase()).filter(Boolean))].slice(0, MAX_TAGS),
    createdAt: text(value.createdAt, 40) || new Date().toISOString()
  };
}

function normaliseArchive(value) {
  if (!Array.isArray(value) || value.length > MAX_MEMORIES) return null;
  try { if (JSON.stringify(value).length > MAX_ARCHIVE_CHARS) return null; } catch { return null; }
  const memories = value.map((memory) => normaliseMemory(memory)).filter(Boolean);
  if (memories.length !== value.length) return null;
  const ids = new Set();
  memories.forEach((memory) => { if (ids.has(memory.id)) memory.id = makeId(); ids.add(memory.id); });
  return memories;
}

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE, { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function readDatabase(database) {
  return new Promise((resolve) => {
    if (!database) return resolve(null);
    try {
      const request = database.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get('memories');
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

function writeDatabase(database, memories) {
  return new Promise((resolve) => {
    if (!database) return resolve(false);
    try {
      const request = database.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put({ key: 'memories', value: memories, savedAt: new Date().toISOString() });
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch { resolve(false); }
  });
}

function readLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : normaliseArchive(JSON.parse(raw));
  } catch { return null; }
}

function writeLocalStorage(memories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    return true;
  } catch { return false; }
}

async function loadArchive(database) {
  const indexed = normaliseArchive(await readDatabase(database));
  if (indexed) { state.storage = 'indexeddb'; return indexed; }
  const local = readLocalStorage();
  if (local !== null) {
    state.storage = database ? 'indexeddb' : 'browser';
    if (database) await writeDatabase(database, local);
    return local;
  }
  state.storage = database ? 'indexeddb' : 'browser';
  return seedMemories;
}

async function saveArchive() {
  const database = state.database;
  try { if (JSON.stringify(state.memories).length > MAX_ARCHIVE_CHARS) return false; } catch { return false; }
  const saved = database ? await writeDatabase(database, state.memories) : false;
  if (saved) return true;
  return writeLocalStorage(state.memories);
}

function formatDate(date) {
  if (!date) return 'DATE UNKNOWN';
  if (date.length <= 18) return date.toUpperCase();
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date.toUpperCase() : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(parsed);
}

function getVisibleMemories() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.memories.filter((memory) => {
    const searchable = [memory.title, memory.person, memory.place, memory.body, ...(memory.tags || [])].join(' ').toLowerCase();
    return !query || searchable.includes(query);
  });
  return state.filter === 'recent' ? filtered.slice(0, 6) : filtered;
}

function renderStats() {
  const people = new Set(state.memories.map((memory) => memory.person.toLowerCase())).size;
  const words = state.memories.reduce((sum, memory) => sum + `${memory.title} ${memory.body}`.trim().split(/\s+/).filter(Boolean).length, 0);
  $('#memory-count').textContent = String(state.memories.length).padStart(2, '0');
  $('#all-filter-count').textContent = String(state.memories.length).padStart(2, '0');
  $('#people-count').textContent = String(people).padStart(2, '0');
  $('#word-count').textContent = words.toLocaleString('en-US');
}

function renderCards() {
  const memories = getVisibleMemories();
  $('#archive-grid').innerHTML = memories.map((memory, index) => `
    <article class="memory-card" style="animation-delay:${index * 60}ms">
      <div class="card-top"><span class="card-date">${escapeHTML(formatDate(memory.date))}</span><span class="card-sigil">${index % 3 === 1 ? '◈' : index % 3 === 2 ? '✳' : '◌'}</span></div>
      <h3>${escapeHTML(memory.title)}</h3>
      <p class="card-person">${escapeHTML(memory.person)}${memory.place ? ` · ${escapeHTML(memory.place)}` : ''}</p>
      <p class="card-excerpt">${escapeHTML(memory.body)}</p>
      <div class="card-bottom"><div class="tag-list">${memory.tags.slice(0, 3).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div><button class="open-card" data-memory-id="${escapeHTML(memory.id)}">Open memory →</button></div>
    </article>`).join('');
  $('#empty-state').classList.toggle('hidden', memories.length !== 0);
  $('#archive-grid').classList.toggle('hidden', memories.length === 0);
  $$('.open-card').forEach((button) => button.addEventListener('click', () => openDetail(button.dataset.memoryId)));
}

function render() { renderStats(); renderCards(); }
function showModal(id) { $(id).classList.remove('hidden'); document.body.style.overflow = 'hidden'; const first = $(id).querySelector('input, textarea, button'); if (first) setTimeout(() => first.focus(), 30); }
function closeModals() { $$('.modal-backdrop').forEach((modal) => modal.classList.add('hidden')); document.body.style.overflow = ''; }

function openDetail(id) {
  const memory = state.memories.find((item) => item.id === id);
  if (!memory) return;
  state.selectedMemory = memory;
  $('#detail-content').innerHTML = `<div class="detail-kicker">${escapeHTML(formatDate(memory.date))}</div><h2 id="detail-title">${escapeHTML(memory.title)}</h2><p class="detail-person">${escapeHTML(memory.person)}${memory.place ? ` · ${escapeHTML(memory.place)}` : ''}</p><div class="detail-body">${escapeHTML(memory.body)}</div><div class="detail-meta">${memory.tags.map((tag) => `<span>#${escapeHTML(tag)}</span>`).join('')}</div><div class="detail-actions"><button class="primary-button" id="detail-echo-button">Ask for an echo <span>✦</span></button><button class="secondary-button" id="detail-close-button">Close</button></div>`;
  $('#detail-echo-button').addEventListener('click', () => { closeModals(); generateEcho(memory); document.querySelector('.model-section').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  $('#detail-close-button').addEventListener('click', closeModals);
  showModal('#detail-modal');
}

function setEngine(engine) {
  state.engine = engine === 'ollama' ? 'ollama' : 'fallback';
  try { localStorage.setItem(ENGINE_KEY, state.engine); } catch { /* localStorage is optional */ }
  $$('.segment').forEach((button) => button.classList.toggle('active', button.dataset.engine === state.engine));
  $('#engine-note').textContent = state.engine === 'ollama' ? 'Runs on localhost through Ollama. Your story stays on this machine.' : 'No server. No account. A tiny local ritual engine.';
}

function fallbackEcho(memory) {
  const detail = memory.place ? ` in ${memory.place}` : '';
  const tag = memory.tags[0] ? ` The thread of ${memory.tags[0]} is still warm.` : ' The smallest details are still carrying the light.';
  return `What remains of ${memory.title.toLowerCase()} is not only an event, but a way of being${detail}. ${memory.person} is present in the details you kept: the things that were touched, repeated, and quietly understood.${tag}`;
}

async function ollamaEcho(memory, signal) {
  const response = await fetch('http://localhost:11434/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ model: 'llama3.2:3b', stream: false, options: { temperature: 0.65, num_predict: 180 }, prompt: `You are VIGIL, a gentle archival reflection tool. Write a short, poetic reflection of 60-90 words about the memory below. Do not add facts. Do not pretend to be the deceased. Do not use quotation marks. Ground every detail in the source. Return only the reflection.\n\nTitle: ${memory.title}\nPerson: ${memory.person}\nPlace: ${memory.place}\nMemory: ${memory.body}` }) });
  if (!response.ok) throw new Error('Ollama unavailable');
  const data = await response.json();
  if (!data.response || typeof data.response !== 'string' || !data.response.trim()) throw new Error('Empty Ollama response');
  return data.response.trim().slice(0, 8_000);
}

async function generateEcho(memory) {
  state.selectedMemory = memory;
  const engine = state.engine;
  state.echoRequest?.abort();
  const controller = new AbortController();
  state.echoRequest = controller;
  const requestId = ++state.echoRequestId;
  const timeout = setTimeout(() => controller.abort(), 15_000);
  $('#echo-placeholder').classList.add('hidden'); $('#echo-result').classList.remove('hidden'); $('#echo-result').setAttribute('aria-busy', 'true'); $('#echo-result').innerHTML = '<p class="echo-loading">Listening for the signal<span> ···</span></p>'; $('#echo-source').textContent = `Source: ${memory.title}`; $('#copy-echo-button').classList.add('hidden');
  try {
    const textResult = engine === 'ollama' ? await ollamaEcho(memory, controller.signal) : fallbackEcho(memory);
    if (requestId !== state.echoRequestId) return;
    state.echo = textResult;
    $('#echo-result').innerHTML = `<p>${escapeHTML(textResult)}</p><div class="echo-meta">${engine === 'ollama' ? 'LOCAL OPEN MODEL · OLLAMA' : 'LOCAL WHISPERER · OFFLINE'} · INTERPRETATION, NOT SOURCE</div>`;
    $('#echo-result').setAttribute('aria-busy', 'false');
    $('#copy-echo-button').classList.remove('hidden');
  } catch (error) {
    if (requestId !== state.echoRequestId || error.name === 'AbortError') return;
    state.echo = fallbackEcho(memory);
    $('#echo-result').innerHTML = `<p>${escapeHTML(state.echo)}</p><div class="echo-meta">LOCAL WHISPERER · OFFLINE FALLBACK · INTERPRETATION, NOT SOURCE</div>`;
    $('#echo-result').setAttribute('aria-busy', 'false');
    $('#copy-echo-button').classList.remove('hidden');
    toast('Ollama was unavailable — the offline Whisperer kept the archive awake.');
  } finally { clearTimeout(timeout); if (requestId === state.echoRequestId) state.echoRequest = null; }
}

function toast(message) { const element = $('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 4300); }

function downloadArchive() {
  try {
    const blob = new Blob([JSON.stringify({ product: 'VIGIL', version: 1, exportedAt: new Date().toISOString(), memories: state.memories }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `vigil-archive-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0); toast('Archive exported. The signal is portable.');
  } catch { toast('The archive could not be exported in this browser.'); }
}

function importArchive(file) {
  if (file.size > MAX_IMPORT_BYTES) { toast('That archive is larger than the 4 MB safety limit.'); return; }
  const reader = new FileReader();
  reader.onerror = () => toast('The archive could not be read.');
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const memories = normaliseArchive(Array.isArray(parsed) ? parsed : parsed?.memories);
      if (!memories) throw new Error('Invalid archive');
      if (!window.confirm(`Replace the current archive with ${memories.length} memories? Export the current archive first if you want a backup.`)) return;
      const previous = state.memories; state.memories = memories;
      if (!(await saveArchive())) { state.memories = previous; throw new Error('Could not save archive'); }
      render(); toast(`${state.memories.length} memories brought back into the light.`);
    } catch { toast('That file is not a valid VIGIL archive.'); }
  };
  reader.readAsText(file);
}

$('#new-memory-button').addEventListener('click', () => showModal('#memory-modal'));
$('#empty-add-button').addEventListener('click', () => showModal('#memory-modal'));
$('#about-button').addEventListener('click', () => showModal('#about-modal'));
$('#scroll-archive-button').addEventListener('click', () => $('#archive').scrollIntoView({ behavior: 'smooth' }));
$('#export-button').addEventListener('click', downloadArchive);
$('#import-button').addEventListener('click', () => $('#import-input').click());
$('#import-input').addEventListener('change', (event) => { if (event.target.files[0]) importArchive(event.target.files[0]); event.target.value = ''; });
$$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
$$('.modal-backdrop').forEach((backdrop) => backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModals(); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });
$('#memory-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const memory = normaliseMemory({ id: makeId(), title: data.get('title'), person: data.get('person'), date: data.get('date'), place: data.get('place'), body: data.get('body'), tags: String(data.get('tags') || '').split(',') });
  if (!memory || state.memories.length >= MAX_MEMORIES) { toast('This memory could not be preserved. Check the fields or archive limit.'); return; }
  state.memories.unshift(memory);
  if (!(await saveArchive())) { state.memories.shift(); toast('The memory could not be saved in this browser.'); return; }
  render(); event.currentTarget.reset(); closeModals(); toast('Memory preserved. The watch has recorded it.');
});
$('#search-input').addEventListener('input', (event) => { state.query = event.target.value; renderCards(); });
$$('.filter-button').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; $$('.filter-button').forEach((item) => item.classList.toggle('active', item === button)); renderCards(); }));
$$('.segment').forEach((button) => button.addEventListener('click', () => setEngine(button.dataset.engine)));
$('#copy-echo-button').addEventListener('click', async () => { if (!state.echo) return; try { await navigator.clipboard.writeText(state.echo); toast('Echo copied to your clipboard.'); } catch { toast('Clipboard access was denied by the browser.'); } });

function tick() { $('#watch-time').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); }

async function boot() {
  try {
    state.engine = localStorage.getItem(ENGINE_KEY) === 'ollama' ? 'ollama' : 'fallback';
  } catch { state.engine = 'fallback'; }
  state.database = await openDatabase();
  state.memories = await loadArchive(state.database);
  setEngine(state.engine); render(); tick(); setInterval(tick, 1000);
}

boot().catch(() => { state.memories = seedMemories; setEngine('fallback'); render(); tick(); });
