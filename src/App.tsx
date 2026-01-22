import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ChatPage,
  LoginPage,
  TermsPage,
  PrivacyPage,
  OnboardingPage,
} from "@/pages";
import { ToastContainer } from "@/components/common";
import { useSettingsStore, useAuthStore } from "@/store";
import type { User } from "@/types";

function App() {
  const { initializeTheme } = useSettingsStore();
  const login = useAuthStore((state) => state.login);
  const loginWithNativeUser = useAuthStore(
    (state) => state.loginWithNativeUser,
  );

  // 앱 전체에서 테마 초기화 (모든 라우트에 적용)
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // 네이티브 앱에서 토큰 갱신 알림 수신 (로그인 처리 및 프로필 정보 갱신)
  useEffect(() => {
    const handleNativeTokenRefreshed = (
      event: CustomEvent<{ token: string; userInfo?: User | null }>,
    ) => {
      console.log("[App] Native token refreshed, syncing auth state...");
      const { token, userInfo } = event.detail;

      if (token) {
        if (userInfo) {
          // 네이티브에서 유저 정보 전달됨 → 즉시 UI 업데이트 (Optimistic)
          console.log(
            "[App] Using native user info for optimistic UI:",
            userInfo.email,
          );
          loginWithNativeUser(token, userInfo).catch((err) => {
            console.error("[App] Failed to sync auth state:", err);
          });
        } else {
          // 유저 정보 없음 → 기존 방식 (API로 fetch)
          login(token).catch((err) => {
            console.error(
              "[App] Failed to sync auth state from native token:",
              err,
            );
          });
        }
      }
    };

    window.addEventListener(
      "nativeTokenRefreshed",
      handleNativeTokenRefreshed as EventListener,
    );

    return () => {
      window.removeEventListener(
        "nativeTokenRefreshed",
        handleNativeTokenRefreshed as EventListener,
      );
    };
  }, [login, loginWithNativeUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 게스트도 접근 가능한 채팅 라우트 (프로필 체크 없음) */}
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
