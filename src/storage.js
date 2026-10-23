// ── Recent launches — localStorage persistence ────────

const STORAGE_KEY = 'launchpad_recent';
const MAX_ITEMS = 5;

/**
 * Load the recent-launches list from localStorage.
 * @returns {string[]}
 */
export function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Prepend a URL to the recent list (de-duplicated, capped at MAX_ITEMS)
 * and persist to localStorage.
 * @param {string} url
 * @returns {string[]} the updated list
 */
export function saveRecent(url) {
  let list = loadRecent().filter((u) => u !== url);
  list.unshift(url);
  list = list.slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}
