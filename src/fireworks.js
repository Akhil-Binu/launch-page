// ── High-Performance Wide-Screen Fireworks Engine ──────────────────────

export class FireworksDisplay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rockets = [];
    this.particles = [];
    this.isRunning = false;
    this.rafId = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.clear();
  }

  clear() {
    this.rockets = [];
    this.particles = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Launch a firework rocket aimed at a specific target
   */
  launchRocket(startX, startY, targetX, targetY, color) {
    this.start();
    const colors = [
      '#6366f1', '#a855f7', '#ec4899', '#38bdf8',
      '#34d399', '#facc15', '#f97316', '#f43f5e'
    ];
    const pickedColor = color || colors[Math.floor(Math.random() * colors.length)];

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const distance = Math.hypot(targetX - startX, targetY - startY);
    const speed = Math.max(12, distance / 32);

    this.rockets.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      targetX,
      targetY,
      color: pickedColor,
      trail: [],
      distanceTraveled: 0,
      totalDistance: distance
    });
  }

  /**
   * Detonate rocket into wide chrysanthemum / willow explosion
   */
  explode(x, y, color, isMega = false) {
    const count = isMega ? 80 : 45;
    const colors = [
      color,
      '#ffffff',
      '#facc15',
      '#a855f7',
      '#ec4899',
      '#38bdf8'
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = isMega ? Math.random() * 8 + 3 : Math.random() * 5.5 + 2;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: isMega ? Math.random() * 0.015 + 0.01 : Math.random() * 0.02 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: isMega ? Math.random() * 2.5 + 1.5 : Math.random() * 2 + 1,
        gravity: 0.12,
        friction: 0.965,
        trail: [],
        twinkle: Math.random() > 0.5
      });
    }
  }

  /**
   * Launch a wide multi-point firework barrage across the entire screen
   * @param {'tick'|'finale'} mode
   */
  launchWideBarrage(mode = 'tick') {
    this.start();
    const w = this.width;
    const h = this.height;

    if (mode === 'tick') {
      // 2 to 3 wide fireworks on alternating left, center, right sides
      const zones = [
        { minX: 0.08, maxX: 0.35, targetY: 0.2 + Math.random() * 0.25 }, // Left wide
        { minX: 0.65, maxX: 0.92, targetY: 0.2 + Math.random() * 0.25 }, // Right wide
      ];

      // Add a third occasionally
      if (Math.random() > 0.3) {
        zones.push({ minX: 0.38, maxX: 0.62, targetY: 0.15 + Math.random() * 0.2 });
      }

      zones.forEach((z, idx) => {
        setTimeout(() => {
          const targetX = (z.minX + Math.random() * (z.maxX - z.minX)) * w;
          const targetY = z.targetY * h;
          const startX = targetX + (Math.random() - 0.5) * (w * 0.2);
          this.launchRocket(startX, h + 10, targetX, targetY);
        }, idx * 120);
      });
    } else {
      // Grand Finale: 6 to 8 fireworks bursting spanning the entire width!
      const columns = [0.08, 0.22, 0.38, 0.5, 0.64, 0.78, 0.92];
      columns.forEach((colRatio, i) => {
        setTimeout(() => {
          const targetX = colRatio * w + (Math.random() - 0.5) * (w * 0.08);
          const targetY = (0.15 + Math.random() * 0.35) * h;
          const startX = (colRatio + (Math.random() - 0.5) * 0.2) * w;
          this.launchRocket(startX, h + 10, targetX, targetY);
        }, i * 90);
      });
    }
  }

  loop() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // ── Update and render rockets ────────────────────
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];

      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 5) r.trail.shift();

      // Draw rocket trail
      this.ctx.beginPath();
      for (let t = 0; t < r.trail.length; t++) {
        const pt = r.trail[t];
        const alpha = (t + 1) / r.trail.length;
        this.ctx.fillStyle = r.color;
        this.ctx.globalAlpha = alpha * 0.8;
        this.ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3);
      }

      r.x += r.vx;
      r.y += r.vy;
      r.distanceTraveled += Math.hypot(r.vx, r.vy);

      // Check if target reached
      if (r.distanceTraveled >= r.totalDistance || r.y <= r.targetY) {
        this.explode(r.targetX, r.targetY, r.color);
        this.rockets.splice(i, 1);
      }
    }

    // ── Update and render particles ──────────────────
    for (let j = this.particles.length - 1; j >= 0; j--) {
      const p = this.particles[j];

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 4) p.trail.shift();

      // Motion physics
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(j, 1);
        continue;
      }

      // Draw particle trail
      this.ctx.beginPath();
      for (let t = 0; t < p.trail.length; t++) {
        const pt = p.trail[t];
        const trailAlpha = (p.alpha * (t + 1)) / p.trail.length;
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = trailAlpha * 0.4;
        this.ctx.fillRect(pt.x - 1, pt.y - 1, 2, 2);
      }

      // Draw particle head with sparkle twinkle
      const currentAlpha = p.twinkle && Math.random() > 0.4 ? p.alpha * 0.4 : p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;

    // Keep loop active while there are active elements
    if (this.rockets.length > 0 || this.particles.length > 0) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
    }
  }
}
