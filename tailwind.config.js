/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        eggshell: "#F6EFE4",
        crimson: "#803B3B",
        chlorophyll: "#0D3626",
        bronze: "#A69986",
        olive: "#29261B",
        ivory: "#F0F0EB",
        stone: "#666663",
      },
    },
  },
  plugins: [],
};
