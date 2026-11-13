import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    navy: { 900: "#0a1a33", 800: "#10264a", 700: "#1a3560" },
    gold: { 300: "#f0d77a", 400: "#e3be4b", 500: "#d4af37", 600: "#b8932a" } } } },
  plugins: [],
} satisfies Config;
