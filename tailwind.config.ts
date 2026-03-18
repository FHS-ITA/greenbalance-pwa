import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: "#B2AC88",
          light: "#C8C3A0",
          dark: "#8F8A68",
        },
        cream: {
          DEFAULT: "#FFFDD0",
          dark: "#F5F3C0",
        },
        charcoal: {
          DEFAULT: "#333333",
          light: "#555555",
          muted: "#888888",
        },
        ochre: {
          DEFAULT: "#CCAA22",
          light: "#E8C840",
          dark: "#A88B1A",
        },
        earth: {
          DEFAULT: "#8B5E3C",
          light: "#A67B55",
          dark: "#6B4A2E",
        },
        // Alias semantici
        "gb-bg": "#FFFDD0",
        "gb-primary": "#B2AC88",
        "gb-text": "#333333",
        "gb-warning": "#CCAA22",
        "gb-error": "#8B5E3C",
        "gb-muted": "#888888",
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(178,172,136,0.14)",
        card: "0 4px 24px 0 rgba(51,51,51,0.08)",
        glow: "0 0 0 3px rgba(178,172,136,0.3)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "slide-up": "slide-up 0.35s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
