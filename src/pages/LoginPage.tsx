import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useAuthStore,
  useSettingsStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { authService } from "@/api";

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading, logout, error } = useAuthStore();
  const { isMobile } = useUIStore();
  const { addToast } = useToastStore();
  const { resolvedTheme } = useSettingsStore();

  // OAuth 콜백 처리
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token).then(() => {
        // 프로필 유무에 따라 리다이렉트 결정은 useAuthStore.login에서 profile 로드 후
        // 다음 useEffect에서 처리
      });
    }
  }, [searchParams, login]);

  // 로그인 상태 및 프로필에 따른 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      // profile 정보 확인 (모든 필수 필드)
      const p = useAuthStore.getState().profile;
      const hasProfile =
        p?.profile_name?.trim() &&
        p?.student_id?.trim() &&
        p?.college &&
        p?.department &&
        p?.major;

      if (hasProfile) {
        if (!isMobile) {
          addToast("success", t("auth.loginSuccess"));
        }
        navigate("/", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, isMobile, addToast, t]);

  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/login`;
    authService.googleLogin(redirectUri);
  };

  const handleGuestMode = async () => {
    // 기존 로그인 상태 정리 (세션은 첫 메시지 전송 시 생성됨)
    await logout();
    navigate("/");
  };

  const isDark = resolvedTheme === "dark";
  const token = searchParams.get("token");

  // 토큰이 있거나(로그인 진입), 로딩 중이거나, 이미 로그인된 경우(리다이렉트 대기) 로딩 표시
  // 단, 에러가 있으면 로그인 페이지 표시
  const shouldShowLoading = isLoading || (!!token && !error) || isAuthenticated;

  if (shouldShowLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${
          isDark ? "from-[#0c1222] to-[#1a2332]" : "from-[#E8F4FC] to-[#D6EBFA]"
        }`}
      >
        <div
          className={`w-8 h-8 border-4 rounded-full animate-spin ${
            isDark
              ? "border-primary-800 border-t-primary-400"
              : "border-primary-200 border-t-primary-600"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-b ${
        isDark ? "from-[#0c1222] to-[#1a2332]" : "from-[#E8F4FC] to-[#D6EBFA]"
      }`}
    >
      {/* Content - 중앙 정렬 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="text-center">
          <img
            src="/assets/images/logo.svg"
            alt={t("common.appName")}
            className="h-20 md:h-24 mx-auto"
          />
          <p
            className={`text-lg md:text-xl font-medium ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {t("welcome.subtitle")}
          </p>
        </div>

        {/* 웹뷰: 버튼을 로고 아래에 배치 */}
        {!isMobile && (
          <>
            <button
              onClick={handleGoogleLogin}
              className={`flex items-center justify-center gap-2 rounded-full shadow-md px-8 py-3 mt-8 font-medium hover:shadow-lg transition-shadow duration-200 ${
                isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-700"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.googleLogin")}
            </button>
            <button
              onClick={handleGuestMode}
              className={`mt-4 text-sm transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("auth.guestLogin")}
            </button>
          </>
        )}
      </div>

      {/* 모바일: 버튼을 화면 하단에 고정 */}
      {isMobile && (
        <div className="w-full px-4 pb-16 flex flex-col items-center">
          <button
            onClick={handleGoogleLogin}
            className={`flex items-center justify-center gap-3 w-full rounded-full shadow-lg px-6 py-4 font-medium hover:shadow-xl transition-shadow duration-200 ${
              isDark ? "bg-slate-800 text-gray-200" : "bg-white text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("auth.googleLogin")}
          </button>
          <button
            onClick={handleGuestMode}
            className={`mt-4 text-sm transition-colors ${
              isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("auth.guestLogin")}
          </button>
        </div>
      )}
    </div>
  );
};
