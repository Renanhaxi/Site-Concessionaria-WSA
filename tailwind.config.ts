import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        carbon: {
          950: "#09090B",
          900: "#0E0E11",
          850: "#121215",
          800: "#16161A",
          700: "#1F1F24",
          600: "#2A2A31",
        },
        surface: {
          DEFAULT: "#121215",
          hover: "#17171C",
          elevated: "#1B1B21",
          border: "#232329",
        },
        wsa: {
          red: "#D91B22",
          redDark: "#B8141A",
          redLight: "#EF2B33",
          champagne: "#D6C3A5",
          champagneLight: "#EAE0CE",
          gold: "#D6C3A5",
          whatsapp: "#1FAF54",
          whatsappDark: "#199446",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        machined:
          "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 16px 36px -14px rgba(0, 0, 0, 0.75)",
        "machined-hover":
          "inset 0 1px 0 0 rgba(255, 255, 255, 0.14), 0 22px 44px -14px rgba(0, 0, 0, 0.85)",
        "crimson-subtle":
          "inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 10px 24px -8px rgba(217, 27, 34, 0.45)",
      },
      animation: {
        ticker: "ticker 38s linear infinite",
        "sheet-up": "sheetUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.22s ease-out",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        sheetUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
