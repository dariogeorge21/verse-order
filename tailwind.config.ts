import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          blue: "#4A90E2",
          gold: "#D4AF37",
          white: "#F8F9FA",
          dark: "#2C3E50",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "fade-out": "fadeOut 0.3s ease-out",
        "flash-green": "flashGreen 0.25s ease-in-out",
        "flash-red": "flashRed 0.25s ease-in-out",
        "countdown": "countdown 0.5s ease-out",
        "shine": "shine 0.8s ease-in-out",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        flashGreen: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(34, 197, 94, 0.3)" },
        },
        flashRed: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(239, 68, 68, 0.3)" },
        },
        countdown: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shine: {
          "100%": { left: "125%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

