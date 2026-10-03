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
        f1: {
          red: '#e10600',
          darkRed: '#b00400',
          black: '#0d0e12',
          card: '#15171e',
          cardBorder: '#232733',
          cardHover: '#1c1f2a',
          accent: '#ff1801',
          gold: '#e69a0a',
          cyan: '#00d2be',
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
        f1: ['Titillium Web', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(225, 6, 0, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 210, 190, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 135, 0, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
