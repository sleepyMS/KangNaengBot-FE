import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "./locales/ko.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
};

// 네이티브 앱 언어 감지 커스텀 디텍터
const nativeAppDetector = {
  name: "nativeApp",
  lookup() {
    if (typeof window !== "undefined" && window.NATIVE_LOCALE) {
      // "ko-KR" -> "ko" 형태로 변환
      const locale = window.NATIVE_LOCALE.split("-")[0];
      // 지원하는 언어인지 확인
      if (["ko", "en", "ja", "zh"].includes(locale)) {
        return locale;
      }
    }
    return undefined;
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // 네이티브 앱 디텍터를 최우선으로 배치
      order: ["nativeApp", "localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// 커스텀 디텍터 추가 등록
const languageDetector = i18n.services
  .languageDetector as typeof LanguageDetector & {
  addDetector: (detector: {
    name: string;
    lookup: () => string | undefined;
  }) => void;
};
if (languageDetector?.addDetector) {
  languageDetector.addDetector(nativeAppDetector);
}

export default i18n;
