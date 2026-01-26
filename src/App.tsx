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
import {
  AuthGuard,
  PublicGuard,
  OnboardingGuard,
} from "@/components/auth/RouteGuards";
import {
  useSettingsStore,
  useAuthStore,
  useNotificationStore,
  useUIStore,
  useScheduleStore,
  useModalStackStore,
  useHistoryStackStore,
} from "@/store";
import { useHistoryTracker } from "@/hooks/useHistoryTracker";
import type { User } from "@/types";

/**
 * AppContent - BrowserRouter 내부에서 라우터 훅을 사용할 수 있는 컴포넌트
 */
function AppContent() {
  // 네비게이션 히스토리 추적 (react-router 훅 사용)
  useHistoryTracker();

  return (
    <>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 비로그인 유저 전용 (로그인 시 접근 제한) */}
        <Route element={<PublicGuard />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 온보딩 특수 가드 (로그인 상태이나 프로필 미완료 시) */}
        <Route element={<OnboardingGuard />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* 인증 필수 라우트 (프로필 완료 필수) */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:sessionId" element={<ChatPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
}

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

  // 네이티브 앱에서 알림 설정 동기화 메시지 수신 (Global Listener)
  useEffect(() => {
    if (!window.IS_NATIVE_APP) return;

    const { setNotiState } = useNotificationStore.getState();

    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "NOTI_STATE_UPDATED") {
          console.log(
            "[App] Native notification state updated:",
            message.payload,
          );
          setNotiState(message.payload);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    };

    window.addEventListener("message", handleNativeMessage);
    document.addEventListener("message", handleNativeMessage as any);

    return () => {
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener("message", handleNativeMessage as any);
    };
  }, []);

  // 네이티브 뒤로가기 핸들러 (UI 상태 제어)
  useEffect(() => {
    if (!window.IS_NATIVE_APP) return;

    const handleHardwareBackPress = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "HARDWARE_BACK_PRESS") {
          console.log("[App] Hardware back press received");

          // 0. 동적 등록된 모달 스택 먼저 처리 (AlertModal, InputModal 등)
          const { pop: popModal } = useModalStackStore.getState();
          if (popModal()) {
            console.log("[App] Closed modal from stack");
            return;
          }

          const {
            isSettingsModalOpen,
            closeSettingsModal,
            isSidebarOpen,
            setSidebarOpen,
          } = useUIStore.getState();

          const {
            isCanvasOpen,
            isSavedListOpen,
            closeCanvas,
            toggleSavedList,
          } = useScheduleStore.getState();

          // 1. 설정 모달이 열려있으면 닫기
          if (isSettingsModalOpen) {
            console.log("[App] Closing settings modal");
            closeSettingsModal();
            return;
          }

          // 2. 시간표 보관함 목록이 열려있으면 닫기
          if (isSavedListOpen) {
            console.log("[App] Closing saved schedule list");
            toggleSavedList();
            return;
          }

          // 3. 시간표 캔버스가 열려있으면 닫기
          if (isCanvasOpen) {
            console.log("[App] Closing schedule canvas");
            closeCanvas();
            return;
          }

          // 4. 사이드바가 열려있으면 닫기
          if (isSidebarOpen) {
            console.log("[App] Closing sidebar");
            setSidebarOpen(false);
            return;
          }

          // 5. 그 외의 경우: 히스토리 뒤로가기 또는 앱 종료
          // useHistoryStackStore로 정확한 히스토리 깊이 확인
          const { canGoBack, pop: popHistory } =
            useHistoryStackStore.getState();

          if (canGoBack()) {
            console.log("[App] Navigating back via history");
            popHistory(); // 스택 깊이 먼저 감소
            window.history.back();
          } else {
            // 루트 경로이거나 히스토리 스택이 비어있으면 앱 종료
            console.log("[App] Root reached, requesting app exit");
            if (window.sendToNative) {
              window.sendToNative("EXIT_APP", {});
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    };

    window.addEventListener("message", handleHardwareBackPress);
    document.addEventListener("message", handleHardwareBackPress as any);

    return () => {
      window.removeEventListener("message", handleHardwareBackPress);
      document.removeEventListener("message", handleHardwareBackPress as any);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
