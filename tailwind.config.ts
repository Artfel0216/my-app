import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ["var(--font-title)", "cursive"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        // Cores personalizadas para o tema da Lauana
        rosePink: {
          light: "#FFF5F7", // O rosa puxado para o branco
          medium: "#FCE4EC", // O rosa claro para o vidro/contador
          dark: "#D81B60",   // O rosa forte para os textos
        },
      },
    },
  },
  plugins: [],
};
export default config;