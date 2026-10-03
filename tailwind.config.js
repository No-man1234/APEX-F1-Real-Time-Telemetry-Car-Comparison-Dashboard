/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitwall: {
          bg: 'var(--pitwall-bg)',
          panel: 'var(--pitwall-panel)',
          subpanel: 'var(--pitwall-subpanel)',
          card: 'var(--pitwall-card)',
          border: 'var(--pitwall-border)',
          borderLight: 'var(--pitwall-border-light)',
          textMuted: 'var(--pitwall-text-muted)',
          textSecondary: 'var(--pitwall-text-secondary)',
          textBright: 'var(--pitwall-text-bright)',
        },
        fia: {
          purple: 'var(--fia-purple)', // Overall session fastest
          green: 'var(--fia-green)',  // Driver personal best
          yellow: 'var(--fia-yellow)', // Slower or caution
          red: 'var(--fia-red)',    // Red flag / brake
          blue: 'var(--fia-blue)',   // Active mode / Straight
        },
        tyre: {
          soft: '#e10600',
          medium: '#ffd100',
          hard: '#ffffff',
          intermediate: '#16a34a',
          wet: '#0284c7',
        }
      },
      fontFamily: {
        f1: ['"Titillium Web"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
