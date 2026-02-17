import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iron: "#6b6b6b",
        bronze: "#a0522d",
        silver: "#b0b0b0",
        gold: "#daa520",
        platinum: "#00c9a7",
        emerald: "#50c878",
        diamond: "#b9f2ff",
        master: "#9370db",
        grandmaster: "#ff4444",
        challenger: "#f0c040",
      },
    },
  },
  plugins: [],
};

export default config;
