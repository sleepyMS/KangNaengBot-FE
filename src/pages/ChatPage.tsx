import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import {
  ChatInput,
  MessageList,
  WelcomeScreen,
  SuggestedQuestions,
  FeatureSection,
} from "@/components/chat";
import { useChatStore, useUIStore, useModalStore } from "@/store";
import { authService } from "@/api";
import { useTranslation } from "react-i18next";

export const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const {
    messages,
    currentSessionId,
    isLoading,
    selectSession,
    error,
    clearError,
  } = useChatStore();
  const { isMobile } = useUIStore();
  const { openModal } = useModalStore(); // Global Modal
  const { t } = useTranslation();

  // 스크롤 위치에 따른 New Chat 버튼 표시 상태
  const [isAtBottom, setIsAtBottom] = useState(true);

  // URL의 sessionId가 변경되면 해당 세션 로드
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      selectSession(sessionId);
    } else if (!sessionId && currentSessionId) {
      navigate(`/chat/${currentSessionId}`, { replace: true });
    }
  }, [sessionId]);

  // 현재 세션이 변경되면 URL 업데이트
  useEffect(() => {
    if (currentSessionId && !sessionId) {
      navigate(`/chat/${currentSessionId}`, { replace: true });
    } else if (
      currentSessionId &&
      sessionId &&
      currentSessionId !== sessionId
    ) {
      navigate(`/chat/${currentSessionId}`, { replace: true });
    } else if (!currentSessionId && sessionId) {
    } else if (!currentSessionId && sessionId) {
      navigate("/", { replace: true });
    }
  }, [currentSessionId]);

  // 에러 발생 시 글로벌 모달 트리거 (QuotaExceeded)
  useEffect(() => {
    if (error === "GUEST_QUOTA_EXCEEDED") {
      openModal({
        type: "warning",
        title: t("auth.quotaExceeded.title", "대화 횟수 초과"),
        message: t(
          "auth.quotaExceeded.message",
          "게스트 모드에서는 최대 3개의 메시지만 보낼 수 있습니다.\n계속 대화하려면 로그인해주세요.",
        ),
        confirmText: t("auth.loginToContinue", "로그인하고 계속하기"),
        cancelText: t("common.cancel", "취소"),
        onConfirm: () => {
          // 현재 세션 ID 저장 (로그인 후 병합용)
          if (currentSessionId) {
            localStorage.setItem("pending_merge_session_id", currentSessionId);
            localStorage.setItem(
              "login_redirect_url",
              `/chat/${currentSessionId}`,
            );
          }

          // 네이티브 앱 로그인 요청
          if (authService.requestNativeLogin()) {
            clearError();
            return;
          }

          // 현재 세션 ID 저장 (로그인 후 병합용)
          if (currentSessionId) {
            localStorage.setItem("pending_merge_session_id", currentSessionId);
            localStorage.setItem(
              "login_redirect_url",
              `/chat/${currentSessionId}`,
            );
            // 로그인 페이지로 이동 (리다이렉트 URL 포함)
            navigate(`/login?redirect=/chat/${currentSessionId}`);
          } else {
            navigate("/login");
          }
          clearError();
        },
        onCancel: () => {
          clearError();
        },
      });
    }
  }, [error, currentSessionId, navigate, openModal, t, clearError]);

  const showMessageList =
    messages.length > 0 || (currentSessionId && isLoading);

  return (
    <MainLayout>
      {showMessageList ? (
        <>
          <MessageList onScrollChange={setIsAtBottom} />
          <ChatInput showNewChatButton={isAtBottom} />
        </>
      ) : isMobile ? (
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <WelcomeScreen />
            <FeatureSection />
            <SuggestedQuestions />
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent pt-4">
            <ChatInput />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center px-4 w-full h-full">
          {/* Top Half - Greeting */}
          <div className="flex-1 flex flex-col justify-end items-center w-full">
            <WelcomeScreen />
          </div>

          {/* Center - Input */}
          <div className="w-full flex justify-center z-10">
            <ChatInput />
          </div>

          {/* Bottom Half - Features & suggestions */}
          <div className="flex-1 flex flex-col justify-start items-center w-full">
            <FeatureSection />
            <SuggestedQuestions />
          </div>
        </div>
      )}
    </MainLayout>
  );
};
