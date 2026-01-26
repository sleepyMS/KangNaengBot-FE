/**
 * 모달 스택 관리 스토어
 * 안드로이드 뒤로가기 제스처로 모달을 닫기 위한 LIFO 스택 관리
 */
import { create } from "zustand";

interface ModalStackEntry {
  id: string;
  close: () => void;
}

interface ModalStackStore {
  stack: ModalStackEntry[];
  /** 모달 열릴 때 스택에 추가 */
  push: (id: string, close: () => void) => void;
  /** 뒤로가기 시 맨 위 모달 닫기 (성공 시 true) */
  pop: () => boolean;
  /** 모달 닫힐 때 스택에서 제거 */
  remove: (id: string) => void;
}

export const useModalStackStore = create<ModalStackStore>((set, get) => ({
  stack: [],

  push: (id, close) => {
    set((state) => ({
      stack: [...state.stack, { id, close }],
    }));
  },

  pop: () => {
    const { stack } = get();
    if (stack.length === 0) return false;

    const topModal = stack[stack.length - 1];
    // 스택에서 제거
    set((state) => ({
      stack: state.stack.slice(0, -1),
    }));
    // 모달 닫기 콜백 실행
    topModal.close();
    return true;
  },

  remove: (id) => {
    set((state) => ({
      stack: state.stack.filter((entry) => entry.id !== id),
    }));
  },
}));
