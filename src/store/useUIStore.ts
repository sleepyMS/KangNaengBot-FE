import { create } from "zustand";

export type SettingsTabId =
  | "profile"
  | "account"
  | "theme"
  | "language"
  | "notification"
  | "feedback";

interface UIState {
  // State
  isSidebarOpen: boolean;
  isSettingsModalOpen: boolean;
  isMobile: boolean;
  activeSettingsTab: SettingsTabId;

  // Legacy alias (deprecated, use isSettingsModalOpen)
  isProfileModalOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openSettingsModal: (tab?: SettingsTabId) => void;
  closeSettingsModal: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setActiveSettingsTab: (tab: SettingsTabId) => void;

  // Legacy alias (deprecated)
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial State - 모바일이면 사이드바 처음부터 접힌 상태로 시작
  isSidebarOpen:
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  isSettingsModalOpen: false,
  isProfileModalOpen: false, // Legacy alias
  isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
  activeSettingsTab: "profile",

  // Actions
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  openSettingsModal: (tab) =>
    set({
      isSettingsModalOpen: true,
      isProfileModalOpen: true,
      activeSettingsTab: tab || "profile",
    }),

  closeSettingsModal: () =>
    set({
      isSettingsModalOpen: false,
      isProfileModalOpen: false,
      // 닫힐 때 탭을 리셋하면 애니메이션 중 높이가 변해 점프 현상이 발생하므로 제거
      // 다음에 열 때 openSettingsModal에서 초기화됨
    }),

  // isMobile 상태만 업데이트 (초기 상태에서 이미 적절한 값으로 설정됨)
  setIsMobile: (isMobile) => set({ isMobile }),

  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),

  // Legacy alias (deprecated, use openSettingsModal/closeSettingsModal)
  openProfileModal: () =>
    set({
      isSettingsModalOpen: true,
      isProfileModalOpen: true,
      activeSettingsTab: "profile",
    }),
  closeProfileModal: () =>
    set({
      isSettingsModalOpen: false,
      isProfileModalOpen: false,
      // 닫힐 때 탭 리셋 제거
    }),
}));
