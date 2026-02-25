import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        scope: {
          bg: "#060b17",
          surface: "#0e1629",
          surfaceMuted: "#17233c",
          border: "#263756",
          text: "#e6edf7",
          textMuted: "#9ab0d1",
          primary: "#4f7cff",
          primaryHover: "#3f6cf0",
          accent: "#10b981",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#052f23",
          soft: "#b8f5df",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#3e2a07",
          soft: "#fbe8b8",
        },
        error: {
          DEFAULT: "#ef4444",
          foreground: "#3f0d0d",
          soft: "#fecaca",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(3, 10, 23, 0.35)",
      },
      borderRadius: {
        xl: "0.9rem",
      },
    },
  },
};

export default config;
