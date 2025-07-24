import { colors } from "./src/styles/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        neutral: colors.neutral,
      },
      keyframes: {
        'cloud-enter-left': {
          '0%': {
            transform: 'translateX(-100%) scale(1)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateX(0) scale(2.5)',
            opacity: '1',
          },
        },
        'cloud-enter-right': {
          '0%': {
            transform: 'translateX(100%) scale(1)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateX(0) scale(2.5)',
            opacity: '1',
          },
        },
        'circle-expand': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(20)', opacity: '1' },
        },
      },
      animation: {
        'cloud-enter-left': 'cloud-enter-left 1s ease-in-out forwards',
        'cloud-enter-right': 'cloud-enter-right 1s ease-in-out forwards',
        'circle-expand': 'circle-expand 1s cubic-bezier(0.4,0,0.2,1) forwards',
      },
    },
  },
  plugins: [],
};
