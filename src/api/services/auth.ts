import apiClient from "../apiClient";
import type { User } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://agent-backend-api-88199591627.us-east4.run.app";

/**
 * 네이티브 앱 환경인지 확인
 */
export const isNativeApp = (): boolean => {
  // 전역 변수 체크 (JS 주입)
  const isNativeVar = typeof window !== "undefined" && window.IS_NATIVE_APP;

  // User Agent 체크 (HTTP 헤더 기반)
  const isNativeUA =
    typeof navigator !== "undefined" &&
    navigator.userAgent &&
    navigator.userAgent.includes("KangNaengBotApp");

  return !!(isNativeVar || isNativeUA);
};

/**
 * 네이티브 앱에 로그인 요청
 * 사이드바 등에서 /login 페이지 거치지 않고 직접 네이티브 로그인 트리거
 * @returns 네이티브 앱에서 실행되었으면 true, 웹이면 false
 */
export const requestNativeLogin = (): boolean => {
  if (!isNativeApp()) {
    return false;
  }

  const type = "REQUEST_LOGIN";
  const payload = {};

  if (window.sendToNative) {
    window.sendToNative(type, payload);
  } else if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
  } else {
    console.error("[Auth] Native bridge interface missing");
    return false;
  }
  return true;
};

/**
 * Google OAuth 로그인 URL로 리다이렉트
 * 네이티브 앱에서는 브릿지를 통해 네이티브 로그인 요청
 * @param redirectUri 로그인 후 돌아갈 프론트엔드 URL
 */
export const googleLogin = (redirectUri?: string): void => {
  // 네이티브 앱에서는 브릿지 사용
  if (requestNativeLogin()) {
    return;
  }

  // 웹에서는 기존 OAuth 리다이렉트
  const params = new URLSearchParams();
  if (redirectUri) {
    params.append("redirect_uri", redirectUri);
  }
  const queryString = params.toString();
  const url = `${API_BASE_URL}/auth/google/login${
    queryString ? `?${queryString}` : ""
  }`;
  window.location.href = url;
};

/**
 * 현재 로그인된 사용자 정보 조회
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};

/**
 * 테스트용 토큰 생성 (개발용)
 */
export const generateTestToken = async (
  userId: string,
): Promise<{
  access_token: string;
  token_type: string;
  user_id: string;
  note: string;
}> => {
  const response = await apiClient.post("/auth/generate-token", null, {
    params: { user_id: userId },
  });
  return response.data;
};

/**
 * 회원 탈퇴 (Soft Delete)
 */
export const deleteMe = async (): Promise<string> => {
  const response = await apiClient.delete<string>("/auth/me");
  return response.data;
};

/**
 * Refresh Token으로 새 토큰 발급 (Sliding Session)
 * HttpOnly 쿠키로 전송되는 Refresh Token을 사용
 */
export const refreshToken = async (): Promise<{
  access_token: string;
  token_type: string;
}> => {
  const response = await apiClient.post("/auth/refresh");
  return response.data;
};

/**
 * 로그아웃 - 서버의 Refresh Token 쿠키 삭제
 */
export const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};
