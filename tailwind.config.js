/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 10px 40px -10px rgba(59, 130, 246, 0.25)",
      },
    },
  },
  plugins: [],
};
