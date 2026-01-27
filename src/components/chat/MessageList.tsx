import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { Spinner } from "@/components/common";
import { useChatStore, useScheduleStore } from "@/store";
import type { MessageItem } from "@/types";
import { ScheduleMessageHandler } from "@/components/schedule";

/**
 * 메시지 중복 제거 및 1:1 페어링 보장
 */
const deduplicateMessages = (messages: MessageItem[]): MessageItem[] => {
  if (messages.length === 0) return [];

  const result: MessageItem[] = [];
  let lastUserMessage: MessageItem | null = null;

  for (const msg of messages) {
    if (msg.role === "user") {
      if (
        lastUserMessage &&
        lastUserMessage.content === msg.content &&
        result[result.length - 1]?.role === "user"
      ) {
        continue;
      }
      lastUserMessage = msg;
      result.push(msg);
    } else {
      result.push(msg);
      lastUserMessage = null;
    }
  }

  return result;
};

interface MessageListProps {
  onScrollChange?: (isAtBottom: boolean) => void;
}

export const MessageList = ({ onScrollChange }: MessageListProps) => {
  const {
    messages,
    isSending,
    isLoading,
    streamingMessage,
    sendingSessionId,
    currentSessionId,
  } = useChatStore();
  const { isScheduleMode, status: scheduleStatus } = useScheduleStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const scrollEndTimerRef = useRef<number>(0);

  // 세션 전환 감지를 위한 상태
  const prevSessionIdRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef<number>(0);
  const [isSessionTransition, setIsSessionTransition] = useState(false);

  const filteredMessages = useMemo(
    () => deduplicateMessages(messages),
    [messages],
  );

  // 스크롤 위치 체크 (단순화: throttle 제거, 항상 체크)
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // Hysteresis: 현재 상태에 따라 다른 threshold
    const threshold = isAtBottomRef.current ? 30 : 20;
    const shouldBeAtBottom = distanceFromBottom < threshold;

    if (shouldBeAtBottom !== isAtBottomRef.current) {
      isAtBottomRef.current = shouldBeAtBottom;
      onScrollChange?.(shouldBeAtBottom);
    }
  }, [onScrollChange]);

  // 스크롤 이벤트 핸들러 + 스크롤 끝 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkScrollPosition();

      // 스크롤 끝나면 한 번 더 체크 (150ms 후)
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(() => {
        checkScrollPosition();
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [checkScrollPosition]);

  // 세션 전환 감지: currentSessionId 변경 시
  useEffect(() => {
    const isNewSession = prevSessionIdRef.current !== currentSessionId;

    if (isNewSession && currentSessionId !== null) {
      // 세션 전환 시: 애니메이션 활성화 + 즉시 스크롤
      setIsSessionTransition(true);

      // 즉시 바닥으로 스크롤 (애니메이션 없이)
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        isAtBottomRef.current = true;
        onScrollChange?.(true);
      });

      // 애니메이션 완료 후 상태 초기화 (300ms = 애니메이션 duration)
      const timer = setTimeout(() => {
        setIsSessionTransition(false);
      }, 350);

      prevSessionIdRef.current = currentSessionId;
      prevMessageCountRef.current = messages.length;

      return () => clearTimeout(timer);
    }

    prevSessionIdRef.current = currentSessionId;
  }, [currentSessionId, messages.length, onScrollChange]);

  // 새 메시지 추가 시 자동 스크롤 (세션 전환이 아닐 때만)
  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    const isSameSession = prevSessionIdRef.current === currentSessionId;

    // 세션 전환 중이 아니고, 새 메시지가 추가되었을 때만 smooth 스크롤
    if (isSameSession && isNewMessage && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCountRef.current = messages.length;
  }, [messages.length, isSending, currentSessionId]);

  // 초기 로드 시 바닥으로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
    // 초기 상태 설정
    setTimeout(() => {
      isAtBottomRef.current = true;
      onScrollChange?.(true);
    }, 50);
  }, []);

  if (isLoading && currentSessionId && filteredMessages.length === 0) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 pt-14 md:pt-16 pb-6"
    >
      <div
        key={currentSessionId || "empty"}
        className={`max-w-3xl mx-auto space-y-6 ${
          isSessionTransition ? "animate-slide-up" : ""
        }`}
      >
        {filteredMessages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}

        {/* Loading Indicator - 시간표 생성 중엔 ScheduleGeneratingMessage가 대신 표시됨 */}
        {isSending &&
          sendingSessionId === currentSessionId &&
          !(isScheduleMode && scheduleStatus === "generating") && (
            <div className="flex gap-3 items-end animate-slide-up">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/images/logo.svg"
                  alt="강냉봇"
                  className="w-5 h-5"
                />
              </div>
              <div className="bubble-ai flex items-center gap-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {streamingMessage || "생각중"}
                </span>
                <span className="flex gap-0.5 ml-1">
                  <span
                    className="w-1 h-1 bg-primary-400 rounded-full animate-bounce-dot"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-primary-400 rounded-full animate-bounce-dot"
                    style={{ animationDelay: "160ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-primary-400 rounded-full animate-bounce-dot"
                    style={{ animationDelay: "320ms" }}
                  />
                </span>
              </div>
            </div>
          )}

        {/* Schedule Mode Messages */}
        <ScheduleMessageHandler />

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
