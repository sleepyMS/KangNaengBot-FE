import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type Language = "ko" | "en" | "ja" | "zh";

interface SettingsState {
  // State
  theme: Theme;
  language: Language;

  // Computed (실제 적용되는 테마)
  resolvedTheme: "light" | "dark";

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  initializeTheme: () => void;
}

// 시스템 테마 감지 (네이티브 앱에서는 NATIVE_THEME 우선)
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  // 네이티브 앱에서는 주입된 테마 사용
  if (window.NATIVE_THEME) {
    return window.NATIVE_THEME;
  }

  // 웹에서는 브라우저 미디어 쿼리 사용
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// 테마 적용 함수
const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial State
      theme: "system",
      language: "ko",
      resolvedTheme: getSystemTheme(),

      // Actions
      setTheme: (theme) => {
        const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },

      setLanguage: (language) => {
        set({ language });
        // i18n 언어 변경은 LanguageTab에서 처리
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });

        // 시스템 테마 변경 감지
        if (theme === "system") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? "dark" : "light";
            applyTheme(newTheme);
            set({ resolvedTheme: newTheme });
          };
          mediaQuery.addEventListener("change", handler);
        }
      },
    }),
    {
      name: "kangnaeng-settings",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);
