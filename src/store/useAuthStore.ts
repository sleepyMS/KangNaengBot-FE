import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, ProfileResponse } from "@/types";
import { setAccessToken, removeAccessToken } from "@/api";
import { authService, profilesService, sessionsService } from "@/api";
import i18n from "@/i18n";
import { useChatStore } from "./useChatStore";

interface AuthState {
  // State
  user: User | null;
  profile: ProfileResponse | null;
  isAuthenticated: boolean;
  isGuestMode: boolean; // 게스트 모드 여부
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileResponse | null) => void;
  login: (accessToken: string) => Promise<void>;
  loginWithNativeUser: (
    accessToken: string,
    user: User | null,
  ) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Partial<ProfileResponse>) => Promise<void>;
  enterGuestMode: () => void; // 게스트 모드 진입
  exitGuestMode: () => void; // 게스트 모드 종료
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      profile: null,
      isAuthenticated: false,
      isGuestMode: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setProfile: (profile) => set({ profile }),

      login: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          setAccessToken(accessToken);
          // User와 Profile을 모두 가져온 후에 상태 업데이트 (Race Condition 방지)
          const user = await authService.getMe();
          const profile = await profilesService.getProfile();

          // 게스트 세션 병합 처리
          const pendingSessionId = localStorage.getItem(
            "pending_merge_session_id",
          );
          if (pendingSessionId) {
            // Race condition 방지: 즉시 삭제하여 중복 호출 막음
            localStorage.removeItem("pending_merge_session_id");
            try {
              console.log("[Auth] Merging guest session:", pendingSessionId);
              await sessionsService.mergeSession(pendingSessionId);
            } catch (mergeError) {
              console.error("[Auth] Session merge failed:", mergeError);
            }
          }

          // 로그인 성공 시 게스트 ID 초기화 (인증된 사용자로 전환)
          useChatStore.getState().setGuestUserId(null);

          set({
            user,
            profile,
            isAuthenticated: true,
            isGuestMode: false, // 로그인 성공 시 게스트 모드 해제
            isLoading: false,
          });
        } catch (error) {
          removeAccessToken();
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : i18n.t("store.error.login"),
          });
        }
      },

      // 네이티브 앱에서 유저 정보와 함께 로그인 (Optimistic UI)
      loginWithNativeUser: async (accessToken: string, user: User | null) => {
        // 1. 즉시 UI 업데이트 (Optimistic)
        setAccessToken(accessToken);
        set({
          user,
          isAuthenticated: true,
          isGuestMode: false, // 로그인 성공 시 게스트 모드 해제
          isLoading: true, // 프로필 로딩 중
          error: null,
        });

        // 게스트 세션 병합 처리 (웹 login 액션과 동일 로직)
        const pendingSessionId = localStorage.getItem(
          "pending_merge_session_id",
        );
        if (pendingSessionId) {
          localStorage.removeItem("pending_merge_session_id");
          try {
            console.log(
              "[Auth] Merging guest session (Native):",
              pendingSessionId,
            );
            await sessionsService.mergeSession(pendingSessionId);
          } catch (mergeError) {
            console.error("[Auth] Session merge failed (Native):", mergeError);
          }
        }

        // 로그인 성공 시 게스트 ID 초기화
        useChatStore.getState().setGuestUserId(null);

        // 2. 백그라운드에서 프로필 정보 가져오기
        try {
          const profile = await profilesService.getProfile();
          set({ profile, isLoading: false });
        } catch (error: any) {
          console.error("[Auth] Profile fetch failed:", error);

          // 404 에러(프로필 없음)인 경우 신규 유저이므로 온보딩으로 유도 (로그아웃 하지 않음)
          set({ isLoading: false });
        }
      },
      logout: async () => {
        // 1. 먼저 클라이언트 상태 정리 (중복 API 호출 방지)
        removeAccessToken();
        useChatStore.getState().reset();
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isGuestMode: false, // 로그아웃 시 게스트 모드도 해제
          error: null,
        });

        // 2. 서버에서 Refresh Token 쿠키 삭제 (백그라운드)
        try {
          await authService.logout();
        } catch {
          // 로그아웃 API 실패해도 클라이언트는 이미 정리됨
        }

        // 3. 네이티브 앱 로그아웃 요청 (화면 전환)
        authService.requestNativeLogout();
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.deleteMe();
          removeAccessToken();
          useChatStore.getState().reset();
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isGuestMode: false, // 계정 삭제 시 게스트 모드도 해제
            isLoading: false,
          });

          // 네이티브 앱 화면 전환 요청
          authService.requestNativeLogout();
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : i18n.t("store.error.deleteAccount"),
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const profile = await profilesService.getProfile();
          set({ profile, isLoading: false });
        } catch (error: any) {
          console.error("[Auth] Fetch profile failed:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : i18n.t("store.error.profileLoad"),
          });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProfile = await profilesService.saveProfile(profileData);
          set({ profile: updatedProfile, isLoading: false });
        } catch (error: any) {
          // 404 에러(유저 없음)인 경우 탈퇴된 회원이므로 강제 로그아웃
          if (
            error?.response?.status === 404 ||
            error?.message?.includes("404")
          ) {
            console.log(
              "[Auth] User not found (404) during update, forcing logout",
            );
            get().logout();
            return; // 에러 throw 하지 않고 로그아웃
          }

          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : i18n.t("store.error.profileSave"),
          });
          throw error;
        }
      },

      enterGuestMode: () => {
        // 게스트 모드 진입: 인증 없이 ChatPage 접근 허용
        set({
          isGuestMode: true,
          isAuthenticated: false,
          user: null,
          profile: null,
        });
      },

      exitGuestMode: () => {
        set({ isGuestMode: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isGuestMode: state.isGuestMode,
      }),
    },
  ),
);
