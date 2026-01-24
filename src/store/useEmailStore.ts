/**
 * 이메일 작성 모드 상태 관리 Store
 */
import { create } from "zustand";

interface EmailState {
  // 모드 상태
  isEmailMode: boolean;

  // Actions
  enterEmailMode: () => void;
  exitEmailMode: () => void;
  reset: () => void;
}

export const useEmailStore = create<EmailState>((set) => ({
  // Initial State
  isEmailMode: false,

  // Actions
  enterEmailMode: () => {
    set({
      isEmailMode: true,
    });
  },

  exitEmailMode: () => {
    set({
      isEmailMode: false,
    });
  },

  reset: () => {
    set({
      isEmailMode: false,
    });
  },
}));
