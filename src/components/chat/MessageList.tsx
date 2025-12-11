import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { MessageSkeleton } from "@/components/common";
import { useChatStore } from "@/store";

export const MessageList = () => {
  const { messages, isSending, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 세션 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}

        {/* Loading Indicator - 생각중... */}
        {isSending && (
          <div className="flex gap-3 animate-slide-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/assets/images/logo.svg"
                alt="강냉봇"
                className="w-5 h-5"
              />
            </div>
            <div className="bubble-ai flex items-center gap-1">
              <span className="text-sm text-gray-500">생각중</span>
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
