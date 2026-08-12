import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B6DF5",
          dark: "#2A4FBF",
          light: "#E8EEFF",
        },
        surface: "#F7F8FA",
        ink: {
          DEFAULT: "#1A1D26",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        line: "#E5E7EB",
        success: {
          DEFAULT: "#22C55E",
          bg: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#EF4444",
          bg: "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["clamp(2rem, 5vw, 3rem)", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["clamp(1.5rem, 4vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-md": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-sm": ["1rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.08em", fontWeight: "600" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
