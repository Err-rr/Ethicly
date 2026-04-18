/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      colors: {
        google: {
          blue: "#4285F4",
          red: "#EA4335",
          yellow: "#FBBC05",
          green: "#34A853",
          navy: "#0B1F3A"
        }
      },
      boxShadow: {
        soft: "0 14px 34px rgba(60, 64, 67, 0.095)",
        card: "0 8px 24px rgba(60, 64, 67, 0.065)",
        glass: "0 1px 2px rgba(60, 64, 67, 0.12), 0 8px 24px rgba(60, 64, 67, 0.06)"
      },
      borderRadius: {
        xl: "16px",
        lg: "12px"
      }
    }
  },
  plugins: []
};
