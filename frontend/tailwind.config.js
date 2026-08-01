/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#122033',
        navy: '#183153',
        emerald: '#087f5b',
        surface: '#f5f7fa',
        line: '#dfe5ec',
      },
      boxShadow: {
        card: '0 8px 24px rgba(18, 32, 51, 0.07)',
      },
    },
  },
  plugins: [],
}
