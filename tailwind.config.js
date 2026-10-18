/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14171C',
        concrete: '#F3F1EC',
        paper: '#FFFFFF',
        survey: { DEFAULT: '#E8590C', light: '#FF7A33', 50: '#FDEEE4' },
        blueprint: { DEFAULT: '#1F4E79', 50: '#E8EFF6' },
        steel: '#5B6470',
        line: '#DAD6CC',
        success: '#1E7A4C',
        warning: '#B7791F',
        danger: '#B42318',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,23,28,0.06), 0 4px 16px rgba(20,23,28,0.06)',
        lift: '0 8px 30px rgba(20,23,28,0.12)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(31,78,121,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,78,121,0.08) 1px, transparent 1px)',
        'grid-dark': 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      backgroundSize: { grid: '32px 32px' },
      keyframes: {
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
