/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1D4E89", light: "#2C6FB5", dark: "#123458" },
        accent: "#F2A93B",
        ink: "#1A2233",
        surface: "#F5F7FA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        "pulse-slow": { "0%, 100%": { opacity: 0.5, transform: "scale(1)" }, "50%": { opacity: 0.8, transform: "scale(1.08)" } },
        kenburns: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.12)" } },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        kenburns: "kenburns 6s ease-out forwards",
      },
    },
  },
  plugins: [],
};