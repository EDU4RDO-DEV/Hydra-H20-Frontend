const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"], // shadcn/ui usa "class" para el modo oscuro
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        outfit: ["Outfit", ...fontFamily.sans], // Usa tu fuente personalizada
      },
      colors: {
        // Colores de tu CSS actual (simplificados para shadcn/ui)
        border: "var(--color-gray-200)",
        input: "var(--color-gray-300)",
        ring: "var(--color-brand-500)",
        background: "var(--color-gray-50)",
        foreground: "var(--color-gray-900)",
        primary: {
          DEFAULT: "var(--color-brand-500)",
          foreground: "var(--color-white)",
        },
        secondary: {
          DEFAULT: "var(--color-gray-100)",
          foreground: "var(--color-gray-900)",
        },
        // ... agrega otros colores según necesites
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Necesario para shadcn/ui
    // Otros plugins que ya uses
  ],
};