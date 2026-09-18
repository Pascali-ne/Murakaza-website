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
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        heading: ["'Plus Jakarta Sans'", "Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 24px -4px rgba(29, 78, 137, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        subtle: "0 2px 10px rgba(0, 0, 0, 0.04)",
        floating: "0 20px 30px -10px rgba(29, 78, 137, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.04)",
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