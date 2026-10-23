# 🚀 LaunchPad — Futuristic URL Launcher & Aerospace Countdown

A modern, high-performance web application designed to launch and open target websites with cinematic visual effects, aerospace-inspired parabolic telemetry, full-screen fireworks, and rich interactivity.

![Tech Stack](https://img.shields.io/badge/Stack-Vite%20%7C%20TailwindCSS%20%7C%20Vanilla%20JS-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)

---

## ✨ Features

- **🎯 Minimalist Orbital Front Page:**
  - Giant 3D magnetic tilt launch button with real-time cursor tracking.
  - Multi-tiered rotating cybernetic orbital reticle rings with satellite beacon.
  - Specular glass glare sweep and ambient stardust constellation nebula.
  - Live HUD status indicators: System readiness, current mode, destination badge, and sound visualizer.

- **🛰️ Parabolic Flight Trajectory Countdown:**
  - Aerospace launch trajectory arc calculated via quadratic bezier curves ($y = -ax^2 + bx + c$).
  - Real-time rocket tracer projectile gliding along the parabolic arc to the target pad.
  - Live mission telemetry readout (`BOOSTER PRE-IGNITION`, `ASCENT PHASE`, `APOGEE`, `TERMINAL GUIDANCE`, `ORBITAL INSERTION`).
  - Configurable countdown durations: **`3s`**, **`5s`**, and **`10s`**.

- **🎆 Full-Screen Wide Fireworks & Cracker Popper Engine:**
  - Hardware-accelerated 60fps canvas fireworks engine spanning the entire viewport.
  - Synchronized rocket barrages exploding across wide-left, center, and wide-right screen coordinates on every countdown tick.
  - 7-column grand finale fireworks barrage at liftoff.
  - Web Audio API synthesized firecracker pop and snap sounds (no external audio files required, toggleable audio).

- **⚙️ Slide-Up Settings Drawer:**
  - Target URL input with instant normalization (auto-prepends `https://`).
  - Multiple open modes: **New Tab**, **Same Window**, or **Centered Popup (800×600)**.
  - Recent launches history saved locally via `localStorage`.
  - Popup-blocker detection with automatic fallback alerts.

---

## 🛠️ Tech Stack

- **Bundler / Dev Server:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Graphics & FX:** HTML5 Canvas, SVG Paths & Filters, Web Audio API
- **Deployment:** Serverless / Static hosting ready (Vercel, Netlify, Cloudflare Pages, GitHub Pages)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Akhil-Binu/launch-page.git
cd launch-page
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Build for production (Static / Serverless)
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
