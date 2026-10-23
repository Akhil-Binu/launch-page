// ── Ambient Background Particle & Starfield System ──────────────────────

export class AmbientStarfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.targetMouseX = -1000;
    this.targetMouseY = -1000;
    this.rafId = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);

    this.resize();
    this.initStars();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  onMouseMove(e) {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;
  }

  initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 14000); // Responsive density

    const colors = ['#6366f1', '#a855f7', '#38bdf8', '#818cf8', '#ffffff'];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  loop() {
    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw interactive mouse spotlight glow
    if (this.mouseX > 0 && this.mouseY > 0) {
      const grad = this.ctx.createRadialGradient(
        this.mouseX, this.mouseY, 0,
        this.mouseX, this.mouseY, 380
      );
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Update and draw floating stardust particles
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Float
      s.x += s.vx;
      s.y += s.vy;

      // Wrap edges
      if (s.x < 0) s.x = this.width;
      if (s.x > this.width) s.x = 0;
      if (s.y < 0) s.y = this.height;
      if (s.y > this.height) s.y = 0;

      // Mouse repulsion / attraction
      const dx = this.mouseX - s.x;
      const dy = this.mouseY - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120;
        s.x -= (dx / dist) * force * 1.2;
        s.y -= (dy / dist) * force * 1.2;
      }

      // Pulse alpha
      s.alpha = s.baseAlpha + Math.sin(Date.now() * s.pulseSpeed) * 0.2;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = s.color;
      this.ctx.fill();

      // Connect nearby stars with faint cyber constellation lines
      for (let j = i + 1; j < this.stars.length; j++) {
        const s2 = this.stars[j];
        const dist2 = Math.hypot(s.x - s2.x, s.y - s2.y);
        if (dist2 < 85) {
          this.ctx.beginPath();
          this.ctx.moveTo(s.x, s.y);
          this.ctx.lineTo(s2.x, s2.y);
          this.ctx.strokeStyle = '#6366f1';
          this.ctx.globalAlpha = (1 - dist2 / 85) * 0.12;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;

    this.rafId = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
