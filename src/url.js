// ── URL Helpers ────────────────────────────────────────

/**
 * Normalize a URL string: trims whitespace and prepends https:// if no
 * protocol is present.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeUrl(raw) {
  let url = raw.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

/**
 * Check whether a string is a structurally valid URL.
 * @param {string} str
 * @returns {boolean}
 */
export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Strip the protocol from a URL and truncate it for chip display.
 * @param {string} str
 * @param {number} n  max visible characters
 * @returns {string}
 */
export function truncateUrl(str, n = 32) {
  const clean = str.replace(/^https?:\/\//, '');
  return clean.length > n ? clean.slice(0, n) + '…' : clean;
}
