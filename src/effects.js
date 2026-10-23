// ── Effects: ripple, confetti, glow flash, firecracker / popper ──────

/**
 * Web Audio synthetic Firecracker / Party Popper sound effect
 * Zero external audio files required, runs 100% locally.
 */
let audioCtx = null;
let audioEnabled = true;

export function toggleAudio() {
  audioEnabled = !audioEnabled;
  return audioEnabled;
}

export function isAudioEnabled() {
  return audioEnabled;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a realistic synthesized party popper / firecracker pop sound
 * @param {boolean} isMega - louder, multi-layered crackle for the final launch
 */
export function playPopSound(isMega = false) {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Noise burst for the "crack/pop"
    const bufferSize = ctx.sampleRate * (isMega ? 0.18 : 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential decay
      const decay = Math.exp(-i / (bufferSize * 0.25));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to give that authentic "snap/pop" sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isMega ? 1800 : 2400, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isMega ? 0.9 : 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (isMega ? 0.22 : 0.09));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);

    // 2. Low-frequency thud for the "boom/pop" body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isMega ? 320 : 240, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isMega ? 0.2 : 0.1));

    oscGain.gain.setValueAtTime(isMega ? 0.8 : 0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + (isMega ? 0.2 : 0.1));

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + (isMega ? 0.25 : 0.12));

    // If mega, add a second staggered crackle
    if (isMega) {
      setTimeout(() => {
        try {
          const t2 = ctx.currentTime;
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(450, t2);
          osc2.frequency.exponentialRampToValueAtTime(60, t2 + 0.15);
          g2.gain.setValueAtTime(0.5, t2);
          g2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.15);
          osc2.connect(g2);
          g2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 0.16);
        } catch (_) {}
      }, 60);
    }
  } catch (_) {
    // Audio context may fail if user hasn't interacted or permissions restricted; fail gracefully
  }
}

/**
 * Attach a material-style ripple to a button on pointerdown.
 * @param {HTMLElement} btn
 */
export function attachRipple(btn) {
  btn.addEventListener('pointerdown', (e) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/**
 * Triggers a vibrant cracker / popper explosion at given coordinates
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {'tick'|'mega'} intensity
 */
export function triggerCrackerPopper(cx, cy, intensity = 'tick') {
  const isMega = intensity === 'mega';
  const particleCount = isMega ? 75 : 24;
  const colors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#eab308', '#f97316', '#ffffff'
  ];

  // Play auditory pop
  playPopSound(isMega);

  // Screen flash for mega burst
  if (isMega) {
    const flash = document.createElement('div');
    flash.className = 'cracker-flash';
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());
  }

  // 1. Shockwave ring
  const ring = document.createElement('div');
  ring.className = 'cracker-ring';
  const ringSize = isMega ? 160 : 100;
  ring.style.width = `${ringSize}px`;
  ring.style.height = `${ringSize}px`;
  ring.style.left = `${cx - ringSize / 2}px`;
  ring.style.top = `${cy - ringSize / 2}px`;
  ring.style.borderColor = colors[Math.floor(Math.random() * (colors.length - 1))];
  ring.style.boxShadow = `0 0 25px ${ring.style.borderColor}`;
  document.body.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());

  // 2. Radial particles (sparks & confetti bullets)
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'cracker-particle';

    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.backgroundColor = color;
    p.style.boxShadow = `0 0 8px ${color}`;

    const size = isMega ? Math.random() * 8 + 4 : Math.random() * 6 + 3;
    p.style.width = `${size}px`;
    p.style.height = isMega && Math.random() > 0.4 ? `${size * 2.5}px` : `${size}px`;
    p.style.borderRadius = Math.random() > 0.3 ? '50%' : '2px';

    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;

    // Radial velocity
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.6;
    const distance = (isMega ? 90 + Math.random() * 160 : 45 + Math.random() * 95);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    p.style.setProperty('--burst-duration', `${isMega ? 0.75 + Math.random() * 0.45 : 0.5 + Math.random() * 0.35}s`);

    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }

  // 3. Spark trails (shooting firecracker sparks)
  const sparkCount = isMega ? 22 : 8;
  for (let j = 0; j < sparkCount; j++) {
    const spark = document.createElement('div');
    spark.className = 'cracker-spark';
    const sparkLen = isMega ? Math.random() * 20 + 10 : Math.random() * 12 + 6;
    spark.style.height = `${sparkLen}px`;
    spark.style.backgroundColor = Math.random() > 0.3 ? '#facc15' : '#ffffff';
    spark.style.boxShadow = '0 0 10px #facc15';

    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;

    const angle = Math.random() * Math.PI * 2;
    const dist = (isMega ? 110 + Math.random() * 140 : 50 + Math.random() * 70);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);
    spark.style.setProperty('--angle', `${(angle * 180) / Math.PI + 90}deg`);
    spark.style.setProperty('--spark-duration', `${0.45 + Math.random() * 0.35}s`);

    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
}

/**
 * Fire a confetti burst anchored to an element.
 * @param {HTMLElement} anchor
 */
export function confetti(anchor) {
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#38bdf8', '#34d399', '#facc15'];
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = `${cx + (Math.random() - 0.5) * 140}px`;
    el.style.top = `${cy + (Math.random() - 0.5) * 50}px`;
    el.style.animationDuration = `${0.9 + Math.random() * 0.6}s`;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/**
 * Trigger a pulsing glow flash on an element.
 * @param {HTMLElement} el
 */
export function flashSuccess(el) {
  el.classList.add('success-flash');
  el.addEventListener('animationend', () => el.classList.remove('success-flash'), { once: true });
}
