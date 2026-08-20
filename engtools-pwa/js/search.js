// js/search.js
// Normaliza texto para busca tolerante a acentuação e caixa.

export function normalize(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** @returns {boolean} true se `haystack` contém `query`, ignorando acentos/caixa. */
export function matches(query, haystack) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(haystack).includes(q);
}
