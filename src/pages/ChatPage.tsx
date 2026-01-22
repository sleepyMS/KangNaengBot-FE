import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import {
  ChatInput,
  MessageList,
  WelcomeScreen,
  SuggestedQuestions,
} from "@/components/chat";
import { useChatStore, useUIStore, useAuthStore } from "@/store";

export const ChatPage = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const { messages, currentSessionId, isLoading, selectSession } =
    useChatStore();
  const { isMobile } = useUIStore();
  const { isAuthenticated, profile, isLoading: isAuthLoading } = useAuthStore();

  // 스크롤 위치에 따른 New Chat 버튼 표시 상태
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Profile completeness check
  const isProfileComplete =
    Boolean(profile?.profile_name?.trim()) &&
    Boolean(profile?.student_id?.trim()) &&
    Boolean(profile?.college) &&
    Boolean(profile?.department) &&
    Boolean(profile?.major);

  // Redirect authenticated users with incomplete profile to onboarding
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isProfileComplete) {
      navigate("/onboarding", { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, isProfileComplete, navigate]);

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
      navigate("/", { replace: true });
    }
  }, [currentSessionId]);

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
            <SuggestedQuestions />
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent pt-4">
            <ChatInput />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <WelcomeScreen />
          <ChatInput />
          <SuggestedQuestions />
        </div>
      )}
    </MainLayout>
  );
};
