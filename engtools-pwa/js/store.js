// js/store.js
// Toda a persistência local do app passa por aqui — nada de localStorage
// espalhado pelo resto do código. Se algo falhar (modo privado, quota
// cheia), as funções falham em silêncio e o app segue funcionando.

const KEYS = {
  theme: 'engtools_theme',
  favorites: 'engtools_favorites',
  history: 'engtools_history',
  takeoff: 'engtools_quantitativos',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---- Tema ----
export function getTheme() {
  try { return localStorage.getItem(KEYS.theme) || 'dark'; } catch { return 'dark'; }
}
export function setTheme(theme) {
  try { localStorage.setItem(KEYS.theme, theme); } catch { /* ignore */ }
}

// ---- Favoritos (ids de calculadoras) ----
export function getFavorites() {
  return readJSON(KEYS.favorites, []);
}
export function isFavorite(id) {
  return getFavorites().includes(id);
}
export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(id);
  writeJSON(KEYS.favorites, favs);
  return favs;
}

// ---- Histórico de uso recente ----
const HISTORY_LIMIT = 8;
export function getHistory() {
  return readJSON(KEYS.history, []);
}
export function pushHistory(calcId) {
  const history = getHistory().filter((h) => h.id !== calcId);
  history.unshift({ id: calcId, ts: Date.now() });
  writeJSON(KEYS.history, history.slice(0, HISTORY_LIMIT));
}
export function clearHistory() {
  writeJSON(KEYS.history, []);
}

// ---- Tabela de Quantitativos ----
export function getTakeoffRows() {
  return readJSON(KEYS.takeoff, []);
}
export function setTakeoffRows(rows) {
  writeJSON(KEYS.takeoff, rows);
}
