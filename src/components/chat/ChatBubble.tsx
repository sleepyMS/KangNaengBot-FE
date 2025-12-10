import ReactMarkdown from "react-markdown";
import type { MessageItem } from "@/types";

interface ChatBubbleProps {
  message: MessageItem;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse" : "items-end"
      } animate-slide-up`}
    >
      {/* Avatar - AI only (하단 정렬) */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/assets/images/logo.svg" alt="강냉봇" className="w-5 h-5" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[80%] md:max-w-[70%]
          ${isUser ? "bubble-user" : "bubble-ai"}
        `}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 text-gray-800">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
