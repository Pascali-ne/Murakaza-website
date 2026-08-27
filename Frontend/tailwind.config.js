/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E5B3A",
          light: "#2E7D4F",
          dark: "#123D26",
        },
        accent: "#F5A623",
      },
    },
  },
  plugins: [],
};