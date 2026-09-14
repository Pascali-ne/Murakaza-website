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
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 0.8, transform: "scale(1.08)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};