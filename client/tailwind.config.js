/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { brand: { red: "#ed1c24", dark: "#252525", graphite: "#575756", mist: "#f6f6f5", line: "#e7e5e4" } },
      boxShadow: { soft: "0 12px 32px rgba(37, 37, 37, .08)" },
    },
  },
  plugins: [],
};
