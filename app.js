const STORAGE_KEY = 'vigil-memory-archive-v1';
const ENGINE_KEY = 'vigil-reflection-engine-v1';

const seedMemories = [
  {
    id: 'seed-radio', title: 'The orange radio', person: 'Abuela Elena', date: 'Summer, 1998', place: 'Her kitchen in Oaxaca',
    body: 'Every Sunday, Abuela Elena tuned the orange radio to the station that played boleros. She cooked slowly, with one hip against the counter, and sang only the parts she remembered. The whole kitchen smelled of cinnamon, warm corn, and the orange peel she kept beside the stove. When the signal faded, she would tap the radio twice and say, “Stay with us.”',
    tags: ['music', 'kitchen', 'voice'], createdAt: '1998-06-01T10:00:00.000Z'
  },
  {
    id: 'seed-marbles', title: 'Three blue marbles', person: 'Milo', date: 'A Tuesday in 2004', place: 'The back steps',
    body: 'Milo kept three blue marbles in the pocket of his school uniform. He said they were planets, and that the smallest one was where he would live when he grew up. In the afternoon sun they looked almost silver. He gave me the middle planet before he left, but I never learned what he named it.',
    tags: ['childhood', 'blue', 'summer'], createdAt: '2004-08-17T10:00:00.000Z'
  },
  {
    id: 'seed-recipe', title: 'The recipe with no measurements', person: 'Papá Tomás', date: 'Undated', place: 'A notebook by the window',
    body: 'Papá Tomás wrote recipes by instinct: a little salt, enough heat, until it smells right. His handwriting leaned forward as if it were always in a hurry to get to the good part. The page for the sweet bread has one flour thumbprint in the margin. It is the only measurement I trust.',
    tags: ['recipe', 'hands', 'home'], createdAt: '2001-01-01T10:00:00.000Z'
  }
];

const state = {
  memories: loadMemories(),
  engine: localStorage.getItem(ENGINE_KEY) || 'fallback',
  query: '',
  filter: 'all',
  selectedMemory: null,
  echo: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadMemories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : seedMemories;
  } catch {
    return seedMemories;
  }
}

function saveMemories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memories));
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function formatDate(date) {
  if (!date) return 'DATE UNKNOWN';
  return date.length > 18 ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(date)) : date.toUpperCase();
}

function getVisibleMemories() {
  const query = state.query.trim().toLowerCase();
  return state.memories.filter((memory) => {
    const searchable = [memory.title, memory.person, memory.place, memory.body, ...(memory.tags || [])].join(' ').toLowerCase();
    return (!query || searchable.includes(query)) && (state.filter === 'all' || state.filter === 'memory');
  });
}

function renderStats() {
  const people = new Set(state.memories.map((memory) => memory.person.trim().toLowerCase())).size;
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
      <div class="card-bottom"><div class="tag-list">${(memory.tags || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div><button class="open-card" data-memory-id="${escapeHTML(memory.id)}">Open memory →</button></div>
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
  $('#detail-content').innerHTML = `
    <div class="detail-kicker">${escapeHTML(formatDate(memory.date))}</div>
    <h2 id="detail-title">${escapeHTML(memory.title)}</h2>
    <p class="detail-person">${escapeHTML(memory.person)}${memory.place ? ` · ${escapeHTML(memory.place)}` : ''}</p>
    <div class="detail-body">${escapeHTML(memory.body)}</div>
    <div class="detail-meta">${(memory.tags || []).map((tag) => `<span>#${escapeHTML(tag)}</span>`).join('')}</div>
    <div class="detail-actions"><button class="primary-button" id="detail-echo-button">Ask for an echo <span>✦</span></button><button class="secondary-button" id="detail-close-button">Close</button></div>`;
  $('#detail-echo-button').addEventListener('click', () => { closeModals(); generateEcho(memory); document.querySelector('.model-section').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  $('#detail-close-button').addEventListener('click', closeModals);
  showModal('#detail-modal');
}

function setEngine(engine) {
  state.engine = engine;
  localStorage.setItem(ENGINE_KEY, engine);
  $$('.segment').forEach((button) => button.classList.toggle('active', button.dataset.engine === engine));
  $('#engine-note').textContent = engine === 'ollama' ? 'Runs on localhost through Ollama. Your story stays on this machine.' : 'No server. No account. A tiny local ritual engine.';
}

function fallbackEcho(memory) {
  const detail = memory.place ? ` in ${memory.place}` : '';
  const tag = memory.tags?.[0] ? ` The thread of ${memory.tags[0]} is still warm.` : ' The smallest details are still carrying the light.';
  return `What remains of ${memory.title.toLowerCase()} is not only an event, but a way of being${detail}. ${memory.person} is present in the details you kept: the things that were touched, repeated, and quietly understood.${tag}`;
}

async function ollamaEcho(memory) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3.2:3b', stream: false, options: { temperature: 0.65 }, prompt: `You are VIGIL, a gentle archival reflection tool. Write a short, poetic reflection of 60-90 words about the memory below. Do not add facts. Do not pretend to be the deceased. Do not use quotation marks. Ground every detail in the source. Return only the reflection.\n\nTitle: ${memory.title}\nPerson: ${memory.person}\nPlace: ${memory.place}\nMemory: ${memory.body}` })
  });
  if (!response.ok) throw new Error('Ollama unavailable');
  const data = await response.json();
  if (!data.response?.trim()) throw new Error('Empty Ollama response');
  return data.response.trim();
}

async function generateEcho(memory) {
  state.selectedMemory = memory;
  $('#echo-placeholder').classList.add('hidden');
  $('#echo-result').classList.remove('hidden');
  $('#echo-result').innerHTML = '<p class="echo-loading">Listening for the signal<span> ···</span></p>';
  $('#echo-source').textContent = `Source: ${memory.title}`;
  $('#copy-echo-button').classList.add('hidden');
  const useOllama = state.engine === 'ollama';
  let text;
  let sourceLabel;
  try {
    text = useOllama ? await ollamaEcho(memory) : fallbackEcho(memory);
    sourceLabel = useOllama ? 'LOCAL OPEN MODEL · OLLAMA' : 'LOCAL WHISPERER · OFFLINE';
  } catch {
    text = fallbackEcho(memory);
    sourceLabel = 'LOCAL WHISPERER · OFFLINE FALLBACK';
    toast('Ollama was not reachable — the offline Whisperer kept the archive awake.');
  }
  state.echo = text;
  $('#echo-result').innerHTML = `<p>${escapeHTML(text)}</p><div class="echo-meta">${sourceLabel} · INTERPRETATION, NOT SOURCE</div>`;
  $('#copy-echo-button').classList.remove('hidden');
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 4300);
}

function downloadArchive() {
  const archive = { product: 'VIGIL', version: 1, exportedAt: new Date().toISOString(), memories: state.memories };
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `vigil-archive-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
  toast('Archive exported. The signal is portable.');
}

function importArchive(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const memories = Array.isArray(parsed) ? parsed : parsed.memories;
      if (!Array.isArray(memories) || memories.some((memory) => !memory.title || !memory.body || !memory.person)) throw new Error('Invalid archive');
      state.memories = memories.map((memory) => ({ ...memory, id: memory.id || crypto.randomUUID() })); saveMemories(); render(); toast(`${state.memories.length} memories brought back into the light.`);
    } catch { toast('That file could not be read as a VIGIL archive.'); }
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
$('#memory-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const memory = { id: crypto.randomUUID(), title: data.get('title').trim(), person: data.get('person').trim(), date: data.get('date').trim() || 'Undated', place: data.get('place').trim(), body: data.get('body').trim(), tags: data.get('tags').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean), createdAt: new Date().toISOString() };
  state.memories.unshift(memory); saveMemories(); render(); event.currentTarget.reset(); closeModals(); toast('Memory preserved. The watch has recorded it.');
});
$('#search-input').addEventListener('input', (event) => { state.query = event.target.value; renderCards(); });
$$('.filter-button').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; $$('.filter-button').forEach((item) => item.classList.toggle('active', item === button)); renderCards(); }));
$$('.segment').forEach((button) => button.addEventListener('click', () => setEngine(button.dataset.engine)));
$('#copy-echo-button').addEventListener('click', async () => { if (!state.echo) return; await navigator.clipboard.writeText(state.echo); toast('Echo copied to your clipboard.'); });

function tick() { $('#watch-time').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); }
setEngine(state.engine); render(); tick(); setInterval(tick, 1000);
