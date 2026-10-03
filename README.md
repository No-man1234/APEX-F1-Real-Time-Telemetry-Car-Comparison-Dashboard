# 🏎️ APEX F1 // Real-Time Telemetry & Car Comparison Dashboard

A high-performance, real-time Formula 1 vehicle dynamics and telemetry comparison platform. 

**Zero API Keys Required • Zero Manual Updates Required • Automatically Syncs with Every Grand Prix**

---

## ⚡ Key Capabilities

### 1. 🔄 Autonomous Session Ingestion (Zero Updates Needed)
- Directly connects to the **OpenF1 Public Telemetry & Timing API**.
- **Auto-Detects the Current / Latest Grand Prix:** Automatically identifies active practice, qualifying, sprint, or race sessions using `session_key=latest`.
- **Live Background Sync:** Real-time polling updates intervals, lap times, sector splits, and vehicle telemetry every 5 seconds without page reload.
- **Season Archive:** Browse any Grand Prix and session across current and past Formula 1 seasons.

### 2. 📊 Multi-Channel Telemetry Comparison
- **High-Frequency Overlay Traces:**
  - **Speed Trace (km/h & mph):** Direct visual overlay of both cars through braking zones, apex minimum speeds, and DRS straights.
  - **Throttle Trace (0–100%):** Pinpoint who gets on power earlier on corner exits.
  - **Braking Trace:** Compare initial brake application, trail-braking pressure, and braking markers.
  - **Engine RPM & Gear Traces:** Shifting patterns and gear ratios.
  - **Lap Delta ($\Delta t$):** Real-time time gained/lost across the circuit.
- **Interactive Scrubber & 60 FPS Replay:**
  - Hover or drag across the lap timeline to inspect exact instantaneous speed, gear, throttle, and RPM for both cars simultaneously.
  - Click **Play** to watch the lap replay at 1x, 2x, or 4x speed.

### 3. 🏁 Dual Cockpit HUD & F1 Steering Wheel Lights
- Dual digital speedometers with km/h / mph toggle.
- 15-LED Formula 1 shift light bar (Green $\rightarrow$ Red $\rightarrow$ Blue/Purple with flashing redline strobe at 12,200+ RPM).
- Throttle and Brake vertical pedal bars.
- Dog ring gear indicators (1–8, N).
- DRS status indicator with active neon glow.

### 4. 🗺️ 2D GPS Circuit Minimap
- Live circuit layout mapped dynamically from car GPS coordinates ($X, Y, Z$).
- Animated car position markers showing both cars moving around the circuit.
- Sector breaks (Sector 1, 2, 3), speed traps, and start/finish line.

### 5. ⏱️ Broadcast Live Timing Tower
- TV-broadcast style classification table.
- Personal Best (Green) and Session Best (Purple) sector splits.
- Tyre compound badges (🔴 Soft, 🟡 Medium, ⚪ Hard, 🟢 Intermediate, 🔵 Wet) with lap age counter.
- One-click **C1 / C2** buttons to load any driver on the grid directly into the comparison view.

### 6. 🎯 Vehicle Dynamics Performance Radar
- Multi-dimensional breakdown:
  - Top Speed / Aerodynamic Low-Drag Efficiency
  - Slow Corner Apex Speed & Mechanical Grip
  - Throttle Pick-up & Exit Traction
  - Late Braking Commitment
  - Power Delivery (% of Lap at Full Throttle)
- Automated engineering verdict summarizing telemetry advantages.

### 7. 🛞 Tyre Compound & Stint Strategy
- Visual stint progression bars with color-coded tyre compounds.
- Tyre degradation estimates and optimal pit window calculations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 20+)
- npm or pnpm

### Installation
```bash
npm install
```

### Run Locally (Development)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Free Deployment (Zero Server Cost)
Because the app communicates directly with OpenF1's CORS-enabled public API, it can be deployed on any static hosting service with **zero backend setup**:

- **Vercel:** Import this repository and hit Deploy.
- **Netlify:** Drag and drop the `dist/` folder or link git repository.
- **GitHub Pages:** Deploy via `gh-pages` or GitHub Actions.
- **Cloudflare Pages:** Build command `npm run build`, output directory `dist`.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Custom F1 Carbon Fiber Design System
- **Icons:** Lucide Icons
- **Data Source:** OpenF1 API (Free, open-source, no key required)
