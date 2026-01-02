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
  withCredentials: true, // HttpOnly 쿠키(Refresh Token) 자동 전송
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

// 토큰 갱신 중복 요청 방지를 위한 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 갱신 완료 후 대기 중인 요청 재시도
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 갱신 대기열에 요청 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
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

// 응답 인터셉터: 에러 핸들링 및 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도가 아니며, refresh 요청이 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      // 이미 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 시도
        const response = await apiClient.post("/auth/refresh");
        const newToken = response.data.access_token;

        setAccessToken(newToken);
        onRefreshed(newToken);
        isRefreshing = false;

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃 처리
        isRefreshing = false;
        refreshSubscribers = [];
        removeAccessToken();
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // 일반 에러 처리
    const apiError: ApiError = {
      message: "알 수 없는 오류가 발생했습니다.",
      status: error.response?.status || 500,
      details: error.response?.data,
    };

    if (error.response) {
      switch (error.response.status) {
        case 401:
          apiError.message = "인증이 필요합니다. 다시 로그인해주세요.";
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
