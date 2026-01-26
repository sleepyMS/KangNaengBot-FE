/**
 * 모달 뒤로가기 제스처 핸들러 훅
 * 네이티브 앱에서 뒤로가기 시 모달을 닫을 수 있도록 스택에 등록/해제
 *
 * @example
 * ```tsx
 * const MyModal = ({ isOpen, onClose }) => {
 *   useModalBackHandler(isOpen, onClose);
 *   if (!isOpen) return null;
 *   return <div>...</div>;
 * };
 * ```
 */
import { useEffect, useRef, useCallback } from "react";
import { useModalStackStore } from "@/store/useModalStackStore";

export const useModalBackHandler = (
  isOpen: boolean,
  onClose: () => void,
): void => {
  const idRef = useRef<string | null>(null);
  const push = useModalStackStore((state) => state.push);
  const remove = useModalStackStore((state) => state.remove);

  // onClose를 안정적인 ref로 유지
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 스택에서 호출될 안정적인 close 함수
  const stableClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    // 네이티브 앱이 아니면 스킵
    if (!window.IS_NATIVE_APP) return;

    if (isOpen) {
      // 모달 열림 - 스택에 등록
      const id = `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      idRef.current = id;
      push(id, stableClose);

      return () => {
        // 클린업 - 스택에서 제거
        if (idRef.current) {
          remove(idRef.current);
          idRef.current = null;
        }
      };
    } else {
      // 모달 닫힘 - 이미 스택에 있다면 제거
      if (idRef.current) {
        remove(idRef.current);
        idRef.current = null;
      }
    }
  }, [isOpen, push, remove, stableClose]);
};
