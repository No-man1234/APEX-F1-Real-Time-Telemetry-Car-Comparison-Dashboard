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
          bg: '#0d0f15',
          panel: '#141722',
          subpanel: '#191d2b',
          card: '#1a1e2d',
          border: '#252a3b',
          borderLight: '#32394f',
          textMuted: '#6f778c',
          textSecondary: '#9ca4ba',
          textBright: '#f3f5f9',
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
