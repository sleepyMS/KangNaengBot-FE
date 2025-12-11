/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // 다크 모드를 .dark 클래스로 활성화
  theme: {
    extend: {
      colors: {
        // 디자이너 시안 기반 컬러 팔레트
        primary: {
          50: "#EBF3FF",
          100: "#D6E7FF",
          200: "#B0D1FF",
          300: "#8ABBFF",
          400: "#4E92FF", // 메인 컬러
          500: "#4E92FF",
          600: "#3D7BE8",
          700: "#2C64D1",
          800: "#1B4DBA",
          900: "#0A36A3",
        },
        navy: {
          50: "#F5F7FA",
          100: "#E4E7EB",
          200: "#CBD2D9",
          300: "#9AA5B1",
          400: "#7B8794",
          500: "#616E7C",
          600: "#52606D",
          700: "#3E4C59",
          800: "#323F4B",
          900: "#1F2933",
        },
        // 강냉봇 브랜드 컬러
        kangnam: {
          blue: "#4E92FF",
          lightBlue: "#69A2FF",
          red: "#E74C3C",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Noto Sans KR",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        brand: "0 4px 40px 0 rgba(105, 162, 255, 0.24)",
        "brand-lg": "0 8px 60px 0 rgba(105, 162, 255, 0.32)",
        input: "0 2px 20px 0 rgba(105, 162, 255, 0.16)",
        button: "0 4px 20px 0 rgba(78, 146, 255, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
        "bounce-dot": "bounceDot 1.4s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #4E92FF 0%, #69A2FF 100%)",
      },
    },
  },
  plugins: [],
};
