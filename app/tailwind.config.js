/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#605BFF',
          light: '#E0E7FF'
        },
        sidebar: '#0F172A',
        surface: '#F7F9FC'
      },
      boxShadow: {
        card: '0px 18px 40px rgba(21, 14, 116, 0.12)'
      }
    }
  },
  plugins: []
};
