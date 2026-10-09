/* Connect Better — app logic.
   The questions live in data/questions.json; this file only draws the screens. */

'use strict';

// ---------- Settings ----------

// The "id" is what questions.json uses in its "category" field.
// "tint" is the soft card colour and "deep" is the matching darker colour.
const CATEGORIES = [
  { id: 'colleagues', label: 'Colleagues', icon: 'briefcase', tint: '#E3ECFB', deep: '#2F5AA8' },
  { id: 'gym', label: 'At the Gym', icon: 'dumbbell', tint: '#FDE6D8', deep: '#B34D18' },
  { id: 'partner', label: 'My Wife / Partner', icon: 'heart', tint: '#FBE1E6', deep: '#B8324F' },
  { id: 'kids', label: 'My Kids', icon: 'balloon', tint: '#FDF0C8', deep: '#7A5A00' },
  { id: 'friends', label: 'Friends', icon: 'people', tint: '#E0F2E6', deep: '#2C7A4B' },
  { id: 'holiday', label: 'On Holiday', icon: 'sun', tint: '#DDF1F4', deep: '#1B6F80' },
];

const LEVELS = [
  { level: 1, name: 'Light', description: 'Fun, easy icebreakers' },
  { level: 2, name: 'Curious', description: 'Interesting questions that encourage stories' },
  { level: 3, name: 'Deep', description: 'Thoughtful, meaningful conversations' },
  { level: 4, name: 'Personal', description: 'More reflective questions that build connection' },
];

// Simple line icons, drawn on a 24 x 24 grid.
const ICONS = {
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 13h18"/>',
  dumbbell: '<rect x="5" y="6.5" width="3.5" height="11" rx="1.3"/><rect x="15.5" y="6.5" width="3.5" height="11" rx="1.3"/><path d="M2.5 10v4"/><path d="M21.5 10v4"/><path d="M8.5 12h7"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
  balloon: '<ellipse cx="12" cy="9" rx="6" ry="6.5"/><path d="M12 15.5V17"/><path d="M12 17c0 2-2.5 2-2.5 4.5"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6"/><path d="M17.5 14.4c2.1.8 3.5 2.9 3.5 5.6"/>',
  sun: '<circle cx="12" cy="9" r="3.2"/><path d="M12 2.5v1.2"/><path d="M5.5 9H4.3"/><path d="M19.7 9h-1.2"/><path d="M7.4 4.4l-.8-.8"/><path d="M17.4 3.6l-.8.8"/><path d="M3 17.5c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>',
};

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#24212B"/><circle cx="12.5" cy="16" r="6.5" fill="#F2795F"/><circle cx="19.5" cy="16" r="6.5" fill="#FAF6EF" fill-opacity="0.9"/></svg>';

// ---------- Saved data (kept in this browser only) ----------

const STORAGE_PREFIX = 'connect-better:';

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (for example in private browsing). The app still works.
  }
}

// ---------- State ----------

let questions = [];
let favourites = load('favourites', []); // question ids, newest first
let seen = load('seen', {}); // questions already shown, per category and level
let current = null; // the question on screen right now
let lastPlace = '#/'; // where the Back button on the Favourites screen returns to

if (!Array.isArray(favourites)) favourites = [];
if (typeof seen !== 'object' || Array.isArray(seen)) seen = {};

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');

// ---------- Small helpers ----------

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
  ));
}

function colours(category) {
  return `style="--tint: ${category.tint}; --deep: ${category.deep}"`;
}

function savedQuestions() {
  return favourites
    .map((id) => questions.find((question) => question.id === id))
    .filter(Boolean);
}

function setView(title, html) {
  document.title = title ? `${title} · Connect Better` : 'Connect Better';
  app.innerHTML = html;
}

function setTopbar({ back, home = true } = {}) {
  const count = savedQuestions().length;
  const onFavourites = location.hash.startsWith('#/favourites');
  topbar.innerHTML = `
    ${back
      ? `<a class="icon-btn" href="${back}" aria-label="Back">${icon('back')}</a>`
      : `<a class="brand" href="#/">${LOGO}<span>Connect Better</span></a>`}
    <nav class="topbar-actions" aria-label="Main">
      ${back && home ? `<a class="icon-btn" href="#/" aria-label="Home">${icon('home')}</a>` : ''}
      <a class="fav-link" href="#/favourites" aria-label="Favourites, ${count} saved" ${onFavourites ? 'aria-current="page"' : ''}>
        ${icon('heart')}<span class="fav-label">Favourites</span>${count ? `<span class="fav-count">${count}</span>` : ''}
      </a>
    </nav>`;
}

// ---------- Choosing questions ----------

// Picks a random question that hasn't been shown yet for this category and level.
// Once every question has been shown, it starts again.
function drawQuestion(key, deck) {
  let seenIds = (seen[key] || []).filter((id) => deck.some((question) => question.id === id));
  let remaining = deck.filter((question) => !seenIds.includes(question.id));

  if (remaining.length === 0) {
    const lastShown = seenIds[seenIds.length - 1];
    seenIds = [];
    // Don't open the new round with the question that closed the last one.
    remaining = deck.length > 1 ? deck.filter((question) => question.id !== lastShown) : deck;
  }

  const question = remaining[Math.floor(Math.random() * remaining.length)];
  seenIds.push(question.id);
  seen[key] = seenIds;
  save('seen', seen);

  return { question, position: seenIds.length, total: deck.length };
}

function toggleFavourite(id) {
  favourites = favourites.includes(id)
    ? favourites.filter((favouriteId) => favouriteId !== id)
    : [id, ...favourites];
  save('favourites', favourites);
}

// ---------- Screens ----------

function showHome() {
  setTopbar();
  setView('', `
    <h1>Who are you with?</h1>
    <p class="lede">Pick a situation and we'll suggest something worth talking about.</p>
    <ul class="category-grid">
      ${CATEGORIES.map((category) => `
        <li>
          <a class="category-card" href="#/${category.id}" ${colours(category)}>
            <span class="category-icon">${icon(category.icon)}</span>
            <span>${category.label}</span>
          </a>
        </li>`).join('')}
    </ul>`);
}

function showLevels(category) {
  setTopbar({ back: '#/', home: false });
  setView(category.label, `
    <section class="narrow" ${colours(category)}>
      <p class="context">${icon(category.icon)}${category.label}</p>
      <h1>How deep do you want to go?</h1>
      <p class="lede">Start light, or go straight to the good stuff.</p>
      <ul class="level-list">
        ${LEVELS.map((level) => `
          <li>
            <a class="level-card" href="#/${category.id}/${level.level}">
              <span class="level-badge" aria-hidden="true">${level.level}</span>
              <span class="level-body">
                <span class="level-name"><span class="visually-hidden">Level ${level.level}: </span>${level.name}</span>
                <span class="level-desc">${level.description}</span>
              </span>
              ${icon('chevron')}
            </a>
          </li>`).join('')}
      </ul>
    </section>`);
}

function showQuestion(category, level) {
  const deck = questions.filter((question) => (
    question.category === category.id && question.level === level.level
  ));
  const place = `${category.label} · Level ${level.level} · ${level.name}`;

  setTopbar({ back: `#/${category.id}` });

  if (deck.length === 0) {
    current = null;
    setView(place, `
      <section class="message">
        <h1>No questions here yet</h1>
        <p>Add some to data/questions.json for this situation and level, then come back.</p>
        <a class="btn btn-primary" href="#/${category.id}">Choose another level</a>
      </section>`);
    return;
  }

  // Coming back to the same category and level keeps the same question on screen.
  const key = `${category.id}/${level.level}`;
  if (!current || current.key !== key) {
    current = { key, deck, ...drawQuestion(key, deck) };
  }

  setView(place, `
    <section class="narrow question-view" ${colours(category)}>
      <h1 class="visually-hidden">${place}</h1>
      <p class="context" aria-hidden="true">${icon(category.icon)}${place}</p>
      <div class="question-slot" id="question-slot" aria-live="polite"></div>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-action="next">Next Question${icon('arrow')}</button>
        <button class="btn btn-secondary" type="button" id="favourite-button" data-action="favourite"></button>
      </div>
    </section>`);
  paintQuestion();
}

// Fills in the question card and the favourite button without redrawing the whole screen.
function paintQuestion() {
  const { question, position, total } = current;
  const saved = favourites.includes(question.id);
  const button = document.getElementById('favourite-button');

  document.getElementById('question-slot').innerHTML = `
    <article class="question-card">
      <p class="question-count">${position} of ${total}</p>
      <p class="question-text">${escapeHtml(question.text)}</p>
    </article>`;

  button.setAttribute('aria-pressed', String(saved));
  button.innerHTML = `${icon('heart')}<span>${saved ? 'Saved to Favourites' : 'Save to Favourites'}</span>`;
}

function showFavourites() {
  const saved = savedQuestions();
  setTopbar({ back: lastPlace });

  if (saved.length === 0) {
    setView('Favourites', `
      <section class="message">
        <h1>No favourites yet</h1>
        <p>Tap "Save to Favourites" on any question you like and it will be kept here.</p>
        <a class="btn btn-primary" href="#/">Find a question</a>
      </section>`);
    return;
  }

  setView('Favourites', `
    <section class="narrow">
      <h1>Favourites</h1>
      <p class="lede">${saved.length === 1 ? '1 saved question' : `${saved.length} saved questions`}</p>
      <ul class="fav-list">
        ${saved.map((question) => {
          const category = CATEGORIES.find((item) => item.id === question.category);
          const level = LEVELS.find((item) => item.level === question.level);
          const place = [category?.label, level && `Level ${level.level} · ${level.name}`].filter(Boolean).join(' · ');
          return `
            <li class="fav-item" ${category ? colours(category) : ''}>
              <div class="fav-body">
                <p class="fav-meta">${place}</p>
                <p class="fav-text">${escapeHtml(question.text)}</p>
              </div>
              <button class="icon-btn fav-remove" type="button" data-action="remove-favourite" data-id="${escapeHtml(question.id)}" aria-label="Remove from favourites">${icon('heart')}</button>
            </li>`;
        }).join('')}
      </ul>
    </section>`);
}

function showLoadError() {
  setTopbar();
  setView('', `
    <section class="message">
      <h1>The questions couldn't be loaded</h1>
      <p>If you opened index.html by double-clicking it, start a local preview instead (see the README).</p>
      <p>If you have just edited data/questions.json, check it for a missing comma or quotation mark.</p>
    </section>`);
}

// ---------- Navigation ----------

// The part of the address after the # decides which screen is shown:
//   #/               home
//   #/friends        levels for a category
//   #/friends/2      a question
//   #/favourites     saved questions
function route() {
  const [first, second] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const category = CATEGORIES.find((item) => item.id === first);
  const level = LEVELS.find((item) => String(item.level) === second);

  if (first === 'favourites') showFavourites();
  else if (category && level) showQuestion(category, level);
  else if (category) showLevels(category);
  else showHome();

  // Replay the entrance animation and start each screen at the top.
  app.classList.remove('view-enter');
  void app.offsetWidth;
  app.classList.add('view-enter');
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', (event) => {
  const oldHash = new URL(event.oldURL).hash || '#/';
  if (!oldHash.startsWith('#/favourites')) lastPlace = oldHash;
  route();
  app.focus({ preventScroll: true });
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  if (button.dataset.action === 'next') {
    Object.assign(current, drawQuestion(current.key, current.deck));
    paintQuestion();
  }

  if (button.dataset.action === 'favourite') {
    toggleFavourite(current.question.id);
    paintQuestion();
    setTopbar({ back: `#/${current.question.category}` });
  }

  if (button.dataset.action === 'remove-favourite') {
    toggleFavourite(button.dataset.id);
    showFavourites();
  }
});

// ---------- Start ----------

async function start() {
  try {
    const response = await fetch('data/questions.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`questions.json returned ${response.status}`);
    const data = await response.json();
    questions = data
      .filter((question) => question && question.id && question.category && question.text)
      .map((question) => ({ ...question, level: Number(question.level) }));
  } catch (error) {
    console.error('Could not load questions:', error);
    showLoadError();
    return;
  }
  route();
}

start();

// Lets the app keep working offline once it has been opened (see service-worker.js).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
