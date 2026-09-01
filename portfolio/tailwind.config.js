/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        butter: {
          50: '#FBF7EA',
          100: '#F7F0DC',
          200: '#F0E6C8',
          300: '#E6D7AC',
          400: '#D9C48C',
        },
        cocoa: {
          500: '#6B4F3A',
          600: '#543E2D',
          700: '#3E2D23',
          800: '#2E2119',
          900: '#241A14',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        hand: ['Kalam', 'cursive'],
      },
    },
  },
  plugins: [],
}