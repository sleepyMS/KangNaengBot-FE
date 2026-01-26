/**
 * 네비게이션 히스토리 추적 스토어
 * 브라우저 히스토리의 현재 위치를 추적하여 뒤로가기 가능 여부 판단
 */
import { create } from "zustand";

interface HistoryStackStore {
  /** 현재 히스토리 스택의 깊이 (초기 페이지 = 0) */
  depth: number;
  /** 히스토리 push 시 호출 (navigation 발생 시) */
  push: () => void;
  /** 히스토리 pop 시 호출 (뒤로가기 시) */
  pop: () => void;
  /** 히스토리 replace 시에는 깊이 유지 */
  replace: () => void;
  /** 뒤로 갈 수 있는지 여부 */
  canGoBack: () => boolean;
}

export const useHistoryStackStore = create<HistoryStackStore>((set, get) => ({
  depth: 0,

  push: () => {
    set((state) => ({ depth: state.depth + 1 }));
  },

  pop: () => {
    set((state) => ({ depth: Math.max(0, state.depth - 1) }));
  },

  replace: () => {
    // replace는 스택 깊이 변경 없음
  },

  canGoBack: () => {
    return get().depth > 0;
  },
}));
