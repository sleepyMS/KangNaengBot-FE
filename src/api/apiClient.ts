import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import type { ApiError } from "@/types";

// API 기본 URL (환경 변수에서 가져옴)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://agent-backend-api-88199591627.us-east4.run.app";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60초 (AI 응답 대기 고려)
});

// 토큰 가져오기 (localStorage에서)
const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

// 토큰 저장하기
export const setAccessToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

// 토큰 삭제하기
export const removeAccessToken = (): void => {
  localStorage.removeItem("access_token");
};

// 요청 인터셉터: Authorization 헤더 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 핸들링
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: "알 수 없는 오류가 발생했습니다.",
      status: error.response?.status || 500,
      details: error.response?.data,
    };

    if (error.response) {
      switch (error.response.status) {
        case 401:
          apiError.message = "인증이 필요합니다. 다시 로그인해주세요.";
          // 토큰 삭제 및 로그인 페이지 리다이렉트
          removeAccessToken();
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
          break;
        case 403:
          apiError.message = "접근 권한이 없습니다.";
          break;
        case 404:
          apiError.message = "요청한 리소스를 찾을 수 없습니다.";
          break;
        case 422:
          apiError.message = "입력값이 올바르지 않습니다.";
          break;
        case 500:
          apiError.message =
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          break;
      }
    } else if (error.request) {
      apiError.message = "네트워크 연결을 확인해주세요.";
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
