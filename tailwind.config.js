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
          purple: '#b142f5', // Overall session fastest
          green: '#00d26a',  // Driver personal best
          yellow: '#ffd100', // Slower or caution
          red: '#e10600',    // Red flag / brake
          blue: '#1e88e5',   // Blue flag
        },
        tyre: {
          soft: '#e10600',
          medium: '#ffd100',
          hard: '#ffffff',
          intermediate: '#39b54a',
          wet: '#0072ce',
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
