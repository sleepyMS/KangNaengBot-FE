import { useEffect, useRef, useMemo } from "react";
import { ChatBubble } from "./ChatBubble";
import { Spinner } from "@/components/common";
import { useChatStore } from "@/store";
import type { MessageItem } from "@/types";

/**
 * 메시지 중복 제거 및 1:1 페어링 보장
 * - 연속된 동일 user 메시지 중복 제거
 * - user → assistant 순서 보장 (응답 없는 중복 user 메시지 필터링)
 */
const deduplicateMessages = (messages: MessageItem[]): MessageItem[] => {
  if (messages.length === 0) return [];

  const result: MessageItem[] = [];
  let lastUserMessage: MessageItem | null = null;

  for (const msg of messages) {
    if (msg.role === "user") {
      // user 메시지: 이전 user 메시지와 내용이 같으면 스킵
      if (
        lastUserMessage &&
        lastUserMessage.content === msg.content &&
        result[result.length - 1]?.role === "user"
      ) {
        // 연속된 동일 user 메시지 → 스킵
        continue;
      }
      lastUserMessage = msg;
      result.push(msg);
    } else {
      // assistant 메시지: 그대로 추가
      result.push(msg);
      lastUserMessage = null; // 응답이 왔으므로 리셋
    }
  }

  return result;
};

export const MessageList = () => {
  const { messages, isSending, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 메시지 중복 제거 (메모이제이션)
  const filteredMessages = useMemo(
    () => deduplicateMessages(messages),
    [messages]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 세션 로딩 중일 때만 AI 스피너 표시 (메시지가 없고, 세션 선택 상태에서만)
  // 게스트 모드에서는 currentSessionId가 null이므로 스피너가 표시되지 않음
  const { currentSessionId } = useChatStore();
  if (isLoading && currentSessionId && filteredMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {filteredMessages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}

        {/* Loading Indicator - 생각중... */}
        {isSending && (
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
                생각중
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

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
