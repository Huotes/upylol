// Tailwind v4 usa configuracao via CSS (@theme em globals.css).
// Este arquivo existe para compatibilidade com ferramentas que
// esperam um tailwind.config (ex: IDE plugins, prettier-plugin-tailwindcss).
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [],
};

export default config;
