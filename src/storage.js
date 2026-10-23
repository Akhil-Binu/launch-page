// ── Recent launches & Settings — localStorage persistence ────────

const STORAGE_KEY = 'launchpad_recent';
const HEADING_STORAGE_KEY = 'launchpad_heading';
const SUBHEADING_STORAGE_KEY = 'launchpad_subheading';
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

/**
 * Load primary heading from localStorage
 * @returns {string}
 */
export function loadHeading() {
  try {
    return localStorage.getItem(HEADING_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Persist primary heading to localStorage
 * @param {string} heading
 */
export function saveHeading(heading) {
  try {
    if (heading && heading.trim()) {
      localStorage.setItem(HEADING_STORAGE_KEY, heading.trim());
    } else {
      localStorage.removeItem(HEADING_STORAGE_KEY);
    }
  } catch (_) {}
}

/**
 * Load second heading / subtitle from localStorage
 * @returns {string}
 */
export function loadSubheading() {
  try {
    return localStorage.getItem(SUBHEADING_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Persist second heading / subtitle to localStorage
 * @param {string} subheading
 */
export function saveSubheading(subheading) {
  try {
    if (subheading && subheading.trim()) {
      localStorage.setItem(SUBHEADING_STORAGE_KEY, subheading.trim());
    } else {
      localStorage.removeItem(SUBHEADING_STORAGE_KEY);
    }
  } catch (_) {}
}
