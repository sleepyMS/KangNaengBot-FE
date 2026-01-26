/**
 * 네비게이션 히스토리 추적 훅
 * react-router의 네비게이션을 감지하여 히스토리 스택 깊이를 관리
 *
 * App.tsx에서 BrowserRouter 내부에서 한 번만 사용
 */
import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useHistoryStackStore } from "@/store/useHistoryStackStore";

export const useHistoryTracker = (): void => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { push, pop, replace } = useHistoryStackStore();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 렌더링은 스킵 (초기 로드)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log("[HistoryTracker] Initial load, skipping");
      return;
    }

    console.log(
      "[HistoryTracker] Navigation:",
      navigationType,
      location.pathname,
    );

    switch (navigationType) {
      case "PUSH":
        push();
        console.log(
          "[HistoryTracker] Pushed, depth:",
          useHistoryStackStore.getState().depth,
        );
        break;
      case "POP":
        pop();
        console.log(
          "[HistoryTracker] Popped, depth:",
          useHistoryStackStore.getState().depth,
        );
        break;
      case "REPLACE":
        replace();
        console.log(
          "[HistoryTracker] Replaced, depth stays:",
          useHistoryStackStore.getState().depth,
        );
        break;
    }
  }, [location, navigationType, push, pop, replace]);
};
