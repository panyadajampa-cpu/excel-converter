/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#f5f3f0',
          100: '#ebe7e1',
          200: '#d4cdc3',
          300: '#b8ae9f',
          400: '#9b8f7c',
          500: '#7e7264',
          600: '#655a4e',
          700: '#4d443a',
          800: '#322d27',
          900: '#1a1713',
          950: '#0d0b09',
        },
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        sage: {
          400: '#86efac',
          500: '#22c55e',
          600: '#16a34a',
        },
        coral: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06)',
        'card-dark': '0 1px 3px rgba(0,0,0,.4),  0 8px 32px rgba(0,0,0,.3)',
        'glow':      '0 0 0 3px rgba(245,158,11,.25)',
        'glow-green':'0 0 0 3px rgba(34,197,94,.25)',
      },
      animation: {
        'spin-slow':  'spin 2s linear infinite',
        'fade-up':    'fadeUp .4s ease forwards',
        'pulse-bar':  'pulseBar 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseBar: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.4 },
        },
      },
    },
  },
  plugins: [],
}
