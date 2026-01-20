import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useAuthStore,
  useSettingsStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { authService } from "@/api";
import {
  detectInAppBrowser,
  openInExternalBrowser,
  copyToClipboard,
} from "@/utils";

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading, logout, error } = useAuthStore();
  const { isMobile } = useUIStore();
  const { addToast } = useToastStore();
  const { resolvedTheme } = useSettingsStore();

  // In-app browser detection state
  const [inAppBrowserInfo] = useState(() => detectInAppBrowser());
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

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

  const handleOpenExternal = () => {
    openInExternalBrowser();
  };

  // Ref for setTimeout cleanup
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyLink = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopyStatus("copied");
      addToast("success", t("auth.inAppBrowser.copied"));
    } else {
      setCopyStatus("failed");
      addToast("error", t("auth.inAppBrowser.copyFailed"));
    }
    // Reset status after 2 seconds (with cleanup)
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopyStatus("idle"), 2000);
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

  // In-app browser warning UI
  const renderInAppBrowserWarning = () => {
    const browserName = inAppBrowserInfo.browserName || "";
    const description = browserName
      ? t("auth.inAppBrowser.description", { browserName })
      : t("auth.inAppBrowser.descriptionGeneric");

    return (
      <div
        role="alert"
        className={`w-full max-w-md mx-auto rounded-2xl p-6 ${
          isDark ? "bg-slate-800/50" : "bg-white/80"
        } backdrop-blur-sm shadow-lg`}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDark ? "bg-amber-500/20" : "bg-amber-100"
            }`}
          >
            <svg
              aria-hidden="true"
              className={`w-8 h-8 ${
                isDark ? "text-amber-400" : "text-amber-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h2
          className={`text-xl font-bold text-center mb-2 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {t("auth.inAppBrowser.title")}
        </h2>
        <p
          className={`text-center text-sm mb-6 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Open External Browser Button */}
          <button
            onClick={handleOpenExternal}
            className={`flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-medium shadow-md transition-all hover:shadow-lg ${
              isDark
                ? "bg-primary-600 hover:bg-primary-500 text-white"
                : "bg-primary-500 hover:bg-primary-600 text-white"
            }`}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {t("auth.inAppBrowser.openExternal")}
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-medium shadow-sm transition-all ${
              isDark
                ? "bg-slate-700 hover:bg-slate-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } ${copyStatus === "copied" ? "ring-2 ring-green-500" : ""}`}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {copyStatus === "copied" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              )}
            </svg>
            {copyStatus === "copied"
              ? t("auth.inAppBrowser.copied")
              : t("auth.inAppBrowser.copyLink")}
          </button>
        </div>

        {/* Instructions */}
        <p
          className={`text-xs text-center mt-4 ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {t("auth.inAppBrowser.instructions")}
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div
            className={`flex-1 h-px ${isDark ? "bg-slate-600" : "bg-gray-300"}`}
          />
          <span
            className={`px-3 text-sm ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("common.or")}
          </span>
          <div
            className={`flex-1 h-px ${isDark ? "bg-slate-600" : "bg-gray-300"}`}
          />
        </div>

        {/* Guest Mode Button */}
        <button
          onClick={handleGuestMode}
          className={`w-full text-sm py-2 transition-colors ${
            isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("auth.inAppBrowser.continueAsGuest")}
        </button>
      </div>
    );
  };

  // Normal login UI
  const renderNormalLoginUI = () => (
    <>
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
    </>
  );

  // Mobile login UI
  const renderMobileLoginUI = () => (
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
  );

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-b ${
        isDark ? "from-[#0c1222] to-[#1a2332]" : "from-[#E8F4FC] to-[#D6EBFA]"
      }`}
    >
      {/* Content - 중앙 정렬 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="text-center mb-6">
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

        {/* Show in-app browser warning or normal login */}
        {inAppBrowserInfo.isInAppBrowser
          ? renderInAppBrowserWarning()
          : !isMobile && renderNormalLoginUI()}
      </div>

      {/* 모바일: 버튼을 화면 하단에 고정 (인앱 브라우저가 아닐 때만) */}
      {isMobile && !inAppBrowserInfo.isInAppBrowser && renderMobileLoginUI()}
    </div>
  );
};
