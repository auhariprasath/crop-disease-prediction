/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agri-green': '#2d5016',
        'leaf-green': '#5a7c3a',
        'light-green': '#8fbc8f',
      }
    },
  },
  plugins: [],
}
