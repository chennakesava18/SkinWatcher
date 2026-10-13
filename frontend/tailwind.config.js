export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#061528",
        ink: "#0a1f3a",
        cyanGlow: "#28e7ff"
      },
      boxShadow: {
        glow: "0 0 36px rgba(40, 231, 255, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

