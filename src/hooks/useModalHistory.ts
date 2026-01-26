import { useEffect, useRef } from "react";

/**
 * 모달의 뒤로가기 처리를 위한 커스텀 훅
 * History API를 사용하여 브라우저/Android 뒤로가기 버튼으로 모달을 닫을 수 있게 합니다.
 *
 * @param isOpen 모달이 열려있는지 여부
 * @param onClose 모달을 닫는 함수
 */
export const useModalHistory = (isOpen: boolean, onClose: () => void) => {
  // 뒤로가기로 닫혔는지 여부를 추적하여 무한 루프 방지
  const closedByBackRef = useRef(false);

  // onClose를 ref로 저장하여 dependency 안정화 (매 렌더링마다 effect 재실행 방지)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // History State 식별을 위한 고유 ID (중복 모달 지원)
  const modalIdRef = useRef(
    `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );

  useEffect(() => {
    if (!isOpen) return;

    // 모달이 열릴 때 History Stack 추가
    // 현재 URL 유지하면서 State만 추가
    const pushHistory = () => {
      // 이미 같은 모달 ID가 최상단에 있다면 중복 푸시 방지
      const state = history.state;
      if (state && state.modalId === modalIdRef.current) return;

      window.history.pushState(
        { modalId: modalIdRef.current },
        "",
        window.location.href,
      );
    };

    pushHistory();
    closedByBackRef.current = false;

    // PopState(뒤로가기) 이벤트 핸들러
    const handlePopState = () => {
      // 뒤로가기가 발생했다면 모달을 닫음
      // 이때 closedByBackRef를 true로 설정하여 cleanup에서 history.back()을 호출하지 않도록 함
      closedByBackRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // 컴포넌트 언마운트(닫힘) 시 Cleanup 로직
      if (!closedByBackRef.current) {
        // 뒤로가기로 닫힌게 아니라면 (예: 닫기 버튼, 배경 클릭)
        // 강제로 뒤로가기를 실행하여 Push했던 History를 제거해줘야 함

        // 주의: 현재 History State가 우리 모달의 것인지 확인 후 Back
        // (사용자가 매우 빠르게 네비게이션했을 경우를 대비)
        if (
          window.history.state &&
          window.history.state.modalId === modalIdRef.current
        ) {
          window.history.back();
        }
      }
    };
  }, [isOpen]);
};
