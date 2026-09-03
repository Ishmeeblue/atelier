/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F6F1E9',
        ink: '#2B2926',
        inksoft: '#8B8478',
        line: '#DCD3C4',
        wine: '#6E1F2A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}