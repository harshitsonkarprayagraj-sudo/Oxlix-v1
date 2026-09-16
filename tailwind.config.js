/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ox-black': '#090909',
        'ox-card': '#171717',
        'ox-card-2': '#1f1f1f',
        'ox-gold': '#d4af37',
        'ox-gold-soft': '#e8c862',
        'ox-gold-dim': '#8a7228',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
