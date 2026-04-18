/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        neon: {
          cyan: "hsl(185, 100%, 55%)",
          purple: "hsl(275, 90%, 65%)",
          green: "hsl(145, 80%, 50%)",
          amber: "hsl(38, 100%, 55%)",
        },
      },
    },
  },
  plugins: [],
};
