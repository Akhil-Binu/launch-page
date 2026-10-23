// ── Main entry point ──────────────────────────────────
import './style.css';
import { normalizeUrl, isValidUrl, truncateUrl } from './url.js';
import { attachRipple, confetti, flashSuccess, toggleAudio, isAudioEnabled } from './effects.js';
import { loadRecent, saveRecent } from './storage.js';
import { createCountdown } from './countdown.js';
import { launch } from './launcher.js';
import { FireworksDisplay } from './fireworks.js';
import { AmbientStarfield } from './ambient.js';

(() => {
  'use strict';

  // ── State ────────────────────────────────────────────
  const DEFAULT_URL = 'https://example.com';
  let targetUrl = DEFAULT_URL;
  let countdownEnabled = false;
  let countdownDuration = 3;

  // ── DOM refs ─────────────────────────────────────────
  const $ = (s) => document.querySelector(s);

  const launchBtn          = $('#launchBtn');
  const targetHint         = $('#targetHint');
  const targetCard         = $('#targetCard');
  const modeBadge          = $('#modeBadge');
  const currentModeLabel   = $('#currentModeLabel');
  const audioToggleBtn     = $('#audioToggleBtn');
  const soundBars          = $('#soundBars');
  const audioLabel         = $('#audioLabel');
  const urlInput           = $('#urlInput');
  const setUrlBtn          = $('#setUrlBtn');
  const urlHint            = $('#urlHint');
  const settingsBtn        = $('#settingsBtn');
  const settingsDrawer     = $('#settingsDrawer');
  const settingsBackdrop   = $('#settingsBackdrop');
  const closeDrawer        = $('#closeDrawer');
  const countdownToggle    = $('#countdownToggle');
  const durationPicker     = $('#durationPicker');
  const recentSection      = $('#recentSection');
  const recentChips        = $('#recentChips');
  const popupAlert         = $('#popupAlert');
  const fireworksCanvas    = $('#fireworksCanvas');
  const ambientCanvas      = $('#ambientCanvas');
  const parabolaArc        = $('#countdownParabola');
  const tracer             = $('#parabolaTracer');
  const countdownTelemetry = $('#countdownTelemetry');
  const telemetryStatus    = $('#telemetryStatus');

  // ── Ambient Interactive Starfield & Cursor Spotlight ──
  const ambient = new AmbientStarfield(ambientCanvas);

  // ── Wide Fireworks Engine ────────────────────────────
  const fireworks = new FireworksDisplay(fireworksCanvas);

  // ── Ripple on the launch button ──────────────────────
  attachRipple(launchBtn);

  // ── Parabolic Countdown Controller ───────────────────
  const countdown = createCountdown(
    {
      overlay:     $('#countdownOverlay'),
      parabolaArc: parabolaArc,
      tracer:      tracer,
      num:         $('#countdownNum'),
      telemetry:   countdownTelemetry,
      status:      telemetryStatus,
      cancelBtn:   $('#cancelCountdown'),
      fireworks:   fireworks,
    },
    () => performLaunch(),
  );

  // ── 3D Magnetic Tilt Effect on Launch Button ─────────
  launchBtn.addEventListener('mousemove', (e) => {
    const rect = launchBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    launchBtn.style.transform = `perspective(500px) rotateX(${-dy * 14}deg) rotateY(${dx * 14}deg) scale3d(1.05, 1.05, 1.05)`;
  });

  launchBtn.addEventListener('mouseleave', () => {
    launchBtn.style.transform = '';
  });

  // ── Audio Toggle Control ─────────────────────────────
  audioToggleBtn.addEventListener('click', () => {
    const enabled = toggleAudio();
    if (enabled) {
      soundBars.classList.remove('opacity-25', 'grayscale');
      audioLabel.textContent = 'AUDIO ON';
      audioLabel.classList.remove('text-slate-500');
      audioLabel.classList.add('text-slate-300');
    } else {
      soundBars.classList.add('opacity-25', 'grayscale');
      audioLabel.textContent = 'AUDIO OFF';
      audioLabel.classList.remove('text-slate-300');
      audioLabel.classList.add('text-slate-500');
    }
  });

  // ── Settings drawer open / close ─────────────────────
  function openSettings() {
    settingsDrawer.classList.add('open');
    settingsBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSettings() {
    settingsDrawer.classList.remove('open');
    settingsBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  settingsBtn.addEventListener('click', openSettings);
  targetCard.addEventListener('click', openSettings);
  modeBadge.addEventListener('click', openSettings);
  closeDrawer.addEventListener('click', closeSettings);
  settingsBackdrop.addEventListener('click', closeSettings);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });

  // ── Target hint display ──────────────────────────────
  function updateHint() {
    targetHint.textContent = truncateUrl(targetUrl, 32);
  }

  // ── Launch mode tracking ─────────────────────────────
  function getMode() {
    return document.querySelector('input[name="mode"]:checked').value;
  }

  function updateModeLabel() {
    const mode = getMode();
    if (mode === 'newtab') currentModeLabel.textContent = 'NEW TAB';
    else if (mode === 'same') currentModeLabel.textContent = 'SAME WINDOW';
    else if (mode === 'popup') currentModeLabel.textContent = 'POPUP 800×600';
  }

  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.addEventListener('change', updateModeLabel);
  });

  // ── URL input handling ───────────────────────────────
  function applyUrl() {
    const raw = urlInput.value;
    const normalized = normalizeUrl(raw);

    if (!normalized) {
      targetUrl = DEFAULT_URL;
      urlHint.textContent = 'Reverted to default URL';
      urlHint.className = 'text-xs text-slate-500 h-4';
      updateHint();
      return;
    }
    if (!isValidUrl(normalized)) {
      urlHint.textContent = 'Invalid URL format';
      urlHint.className = 'text-xs text-red-400 h-4';
      return;
    }

    targetUrl = normalized;
    urlInput.value = normalized;
    urlHint.textContent = '✓ URL set';
    urlHint.className = 'text-xs text-emerald-400 h-4';
    updateHint();
    setTimeout(() => { urlHint.textContent = ''; }, 2000);
  }

  setUrlBtn.addEventListener('click', applyUrl);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyUrl();
  });

  // Live update as user types (debounced)
  let debounce;
  urlInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const normalized = normalizeUrl(urlInput.value);
      if (normalized && isValidUrl(normalized)) {
        targetUrl = normalized;
        urlHint.textContent = '';
        updateHint();
      }
    }, 400);
  });

  // ── Countdown toggle + duration picker ───────────────
  countdownToggle.addEventListener('click', () => {
    countdownEnabled = !countdownEnabled;
    countdownToggle.classList.toggle('active', countdownEnabled);
    countdownToggle.setAttribute('aria-checked', String(countdownEnabled));
    // Show/hide the duration picker
    if (countdownEnabled) {
      durationPicker.classList.remove('hidden');
    } else {
      durationPicker.classList.add('hidden');
    }
  });
  countdownToggle.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      countdownToggle.click();
    }
  });

  // Duration radio buttons
  document.querySelectorAll('input[name="countdown-duration"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      countdownDuration = parseInt(radio.value, 10);
    });
  });

  // ── Recent launches rendering ────────────────────────
  function renderRecent() {
    const list = loadRecent();
    if (!list.length) {
      recentSection.classList.add('hidden');
      return;
    }
    recentSection.classList.remove('hidden');
    recentChips.innerHTML = '';

    list.forEach((url) => {
      const btn = document.createElement('button');
      btn.className =
        'chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ' +
        'bg-white/[.04] border border-white/[.06] text-xs text-slate-300 cursor-pointer';
      btn.innerHTML = `
        <svg class="w-3 h-3 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-6 0l7.5-7.5M15 3h6v6" />
        </svg>
        ${truncateUrl(url)}`;
      btn.title = url;
      btn.addEventListener('click', () => {
        targetUrl = url;
        urlInput.value = url;
        updateHint();
        closeSettings();
        setTimeout(() => performLaunch(), 350);
      });
      recentChips.appendChild(btn);
    });
  }

  // ── Core launch logic ────────────────────────────────
  function performLaunch() {
    popupAlert.classList.add('hidden');

    const ok = launch(targetUrl, getMode());

    if (!ok) {
      popupAlert.classList.remove('hidden');
      setTimeout(() => popupAlert.classList.add('hidden'), 4000);
      return;
    }

    // Success!
    confetti(launchBtn);
    flashSuccess(launchBtn);
    fireworks.launchWideBarrage('finale');
    saveRecent(targetUrl);
    renderRecent();
  }

  // ── Main button click ────────────────────────────────
  launchBtn.addEventListener('click', () => {
    if (countdownEnabled) {
      countdown.start(countdownDuration);
    } else {
      performLaunch();
    }
  });

  // ── Init ─────────────────────────────────────────────
  updateHint();
  updateModeLabel();
  renderRecent();
})();
