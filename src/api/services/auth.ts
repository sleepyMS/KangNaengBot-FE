import apiClient from "../apiClient";
import type { User } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://agent-backend-api-88199591627.us-east4.run.app";

/**
 * Google OAuth 로그인 URL로 리다이렉트
 * @param redirectUri 로그인 후 돌아갈 프론트엔드 URL
 */
export const googleLogin = (redirectUri?: string): void => {
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
  userId: string
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
