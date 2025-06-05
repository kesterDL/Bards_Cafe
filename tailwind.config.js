/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example, matches original intent
      },
      colors: {
        // Add custom colors from the original app if needed
        // e.g. amber, sky, slate shades
      }
    },
  },
  plugins: [],
}
