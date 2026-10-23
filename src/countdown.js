// ── Countdown Controller: Parabolic Trajectory + Fireworks Engine ──────
import { triggerCrackerPopper } from './effects.js';

/**
 * Creates a controller for the parabolic launch countdown.
 * @param {object} els  DOM elements: overlay, parabolaArc, tracer, num, telemetry, status, cancelBtn, fireworks
 * @param {() => void} onComplete  called when countdown reaches zero
 * @returns {{ start: (seconds?: number) => void, cancel: () => void }}
 */
export function createCountdown(
  { overlay, parabolaArc, tracer, num, telemetry, status, cancelBtn, fireworks },
  onComplete
) {
  let intervalId = null;
  let rafId = null;
  let startMs = 0;
  let totalMs = 3000;
  let pathLength = 0;

  function getLength() {
    if (!pathLength && parabolaArc) {
      pathLength = parabolaArc.getTotalLength() || 400;
    }
    return pathLength;
  }

  function cleanup() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function cancel() {
    cleanup();
    if (fireworks) fireworks.clear();
    overlay.classList.add('hidden');
  }

  // Smooth parabolic trajectory sweep & tracer animation via rAF
  function animateParabola() {
    const elapsed = Date.now() - startMs;
    const progress = Math.min(elapsed / totalMs, 1);
    const len = getLength();

    // Fill the glowing parabolic trajectory arc
    if (parabolaArc) {
      parabolaArc.style.strokeDashoffset = String(len * (1 - progress));
    }

    // Move tracer rocket / projectile along the parabola
    if (tracer && parabolaArc) {
      try {
        const pt = parabolaArc.getPointAtLength(len * progress);
        tracer.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      } catch (_) {}
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(animateParabola);
    }
  }

  // Trigger burst effects and telemetry update
  function triggerEffects(intensity = 'tick', remainingSecs = 3) {
    const rect = num.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    triggerCrackerPopper(cx, cy, intensity);

    // Punchy bounce effect on the countdown number
    num.classList.remove('shake-tick');
    void num.offsetWidth; // Force reflow
    num.classList.add('shake-tick');

    // Launch wide-screen fireworks
    if (fireworks) {
      fireworks.launchWideBarrage(intensity === 'mega' ? 'finale' : 'tick');
    }

    // Dynamic Parabolic Telemetry Readout
    if (telemetry) {
      const padded = String(remainingSecs).padStart(2, '0');
      telemetry.textContent = remainingSecs > 0 ? `T-MINUS ${padded}s` : `IGNITION CONFIRMED`;
    }

    if (status) {
      if (remainingSecs >= 8) {
        status.textContent = 'SYSTEM INITIALIZATION • ALL SYSTEMS GO';
      } else if (remainingSecs >= 6) {
        status.textContent = 'PRESSURIZING PROPULSION TANKS';
      } else if (remainingSecs >= 4) {
        status.textContent = 'CALCULATING PARABOLIC TRAJECTORY';
      } else if (remainingSecs === 3) {
        status.textContent = 'BOOSTER PRE-IGNITION';
      } else if (remainingSecs === 2) {
        status.textContent = 'ASCENT PHASE • APOGEE REACHED';
      } else if (remainingSecs === 1) {
        status.textContent = 'TERMINAL GUIDANCE LOCKED';
      } else {
        status.textContent = 'ORBITAL INSERTION / LAUNCH';
      }
    }
  }

  function start(seconds) {
    const total = seconds || 3;
    totalMs = total * 1000;
    let remaining = total;
    const len = getLength();

    // Reset parabolic arc to empty
    if (parabolaArc) {
      parabolaArc.style.strokeDasharray = String(len);
      parabolaArc.style.strokeDashoffset = String(len);
    }

    // Reset tracer to launchpad origin (40, 160)
    if (tracer) {
      tracer.setAttribute('transform', 'translate(40, 160)');
    }

    // Set initial values
    num.textContent = String(remaining);
    overlay.classList.remove('hidden');

    // Initial launch burst & telemetry
    triggerEffects('tick', remaining);

    // Start continuous parabolic animation
    startMs = Date.now();
    rafId = requestAnimationFrame(animateParabola);

    // Decrement countdown each second
    intervalId = setInterval(function () {
      remaining = remaining - 1;

      if (remaining > 0) {
        num.textContent = String(remaining);
        triggerEffects('tick', remaining);
      } else {
        // Complete trajectory & fireworks finale
        cleanup();
        num.textContent = '🚀';
        if (parabolaArc) parabolaArc.style.strokeDashoffset = '0';
        triggerEffects('mega', 0);

        // Pause briefly to enjoy the finale burst, then launch
        setTimeout(function () {
          overlay.classList.add('hidden');
          onComplete();
        }, 600);
      }
    }, 1000);
  }

  cancelBtn.addEventListener('click', cancel);

  return { start, cancel };
}
