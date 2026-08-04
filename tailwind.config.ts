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
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
