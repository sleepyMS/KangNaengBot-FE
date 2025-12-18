import ReactMarkdown from "react-markdown";
import type { MessageItem } from "@/types";

interface ChatBubbleProps {
  message: MessageItem;
}

// HTML 태그를 마크다운으로 변환하는 함수
const convertHtmlToMarkdown = (content: string) => {
  if (!content) return "";

  // <a> 태그 변환: <a href="...">text</a> -> [text](href)
  let markdown = content.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g,
    "[$2]($1)"
  );

  // 필요하다면 다른 태그 변환도 추가 가능 (예: <br> -> \n)
  markdown = markdown.replace(/<br\s*\/?>/g, "\n");

  return markdown;
};

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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
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
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="text-base prose max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 text-gray-800 dark:text-gray-100 dark:prose-invert">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-500 hover:decoration-blue-800 dark:hover:decoration-blue-300 transition-colors break-all"
                  />
                ),
              }}
            >
              {convertHtmlToMarkdown(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
