// ── Launcher: opens URLs in the selected mode ─────────

/**
 * Open a URL according to the chosen launch mode.
 * @param {string} url
 * @param {'newtab'|'same'|'popup'} mode
 * @returns {boolean} true if the launch succeeded
 */
export function launch(url, mode) {
  if (mode === 'same') {
    window.location.href = url;
    return true;
  }

  if (mode === 'popup') {
    const pw = 800;
    const ph = 600;
    const left = (screen.width - pw) / 2;
    const top = (screen.height - ph) / 2;
    const w = window.open(
      url,
      '_blank',
      `width=${pw},height=${ph},left=${left},top=${top},noopener,noreferrer`,
    );
    return !!w;
  }

  // Default: new tab
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  return !!w;
}
