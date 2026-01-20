import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { MessageItem } from "@/types";
import { Calendar, ExternalLink, Copy, Check } from "lucide-react";
import { useScheduleStore, useToastStore } from "@/store";
import { useTranslation } from "react-i18next";

interface ChatBubbleProps {
  message: MessageItem;
}

// HTML 태그를 마크다운으로 변환하는 함수
const convertHtmlToMarkdown = (content: string) => {
  if (!content) return "";

  // <a> 태그 변환: <a href="...">text</a> -> [text](href)
  let markdown = content.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g,
    "[$2]($1)",
  );

  // 필요하다면 다른 태그 변환도 추가 가능 (예: <br> -> \n)
  markdown = markdown.replace(/<br\s*\/?>/g, "\n");

  return markdown;
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const { t } = useTranslation();
  const isUser = message.role === "user";

  // 메시지가 시간표 데이터인지 확인하고 파싱
  const scheduleData = useMemo(() => {
    // 1. 메타데이터가 있는 경우 (실시간 생성 직후 등)
    if (message.type === "schedule_result" && message.metadata?.schedules) {
      return {
        schedules: message.metadata.schedules,
        count:
          message.metadata.scheduleCount || message.metadata.schedules.length,
        text: message.content, // 이 경우 content는 안내 메시지
        isValid: true,
      };
    }

    // 2. Content가 JSON 형태인 경우 (새로고침/히스토리 복원 시)
    try {
      const content = message.content.trim();
      if (content.startsWith("{") && content.endsWith("}")) {
        const parsed = JSON.parse(content);
        if (parsed.success && Array.isArray(parsed.schedules)) {
          return {
            schedules: parsed.schedules,
            count: parsed.schedules.length,
            text:
              parsed.message ||
              t("schedule.status.found", { count: parsed.schedules.length }),
            isValid: true,
          };
        }
      }
    } catch {
      // JSON 파싱 실패 시 일반 텍스트로 처리
    }

    return { isValid: false, schedules: [], count: 0, text: message.content };
  }, [message, t]);

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
        {scheduleData.isValid ? (
          // 시간표 생성 결과 메시지 UI
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={20} className="text-green-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {t("schedule.status.complete")}
              </span>
            </div>
            <p className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {scheduleData.text}
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
              {t("schedule.generated.subtitle", {
                count: scheduleData.count,
              })}
            </div>
            <button
              onClick={() => {
                const store = useScheduleStore.getState();
                // 복원 및 뷰 전환
                store.restoreSchedules(scheduleData.schedules);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mt-1"
            >
              <ExternalLink size={16} />
              <span>{t("schedule.canvas.open")}</span>
            </button>
          </div>
        ) : isUser ? (
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
                pre: ({ children }) => (
                  <div className="code-block-wrapper">{children}</div>
                ),
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className;
                  const [copied, setCopied] = useState(false);
                  const codeContent = String(children).replace(/\n$/, "");
                  const { addToast } = useToastStore();

                  const handleCopy = async () => {
                    await navigator.clipboard.writeText(codeContent);
                    setCopied(true);
                    addToast("success", t("common.codeCopied"));
                    setTimeout(() => setCopied(false), 2000);
                  };

                  if (isInline) {
                    return (
                      <code className="inline-code" {...props}>
                        {children}
                      </code>
                    );
                  }

                  // 언어 추출 (className이 "language-json" 형태)
                  const language = className?.replace("language-", "") || "";

                  return (
                    <div className="code-block">
                      <div className="code-block-header">
                        <span className="code-block-language">
                          {language || "code"}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="code-block-copy"
                          title={t("common.copy")}
                        >
                          {copied ? (
                            <>
                              <Check size={14} /> {t("common.copied")}
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> {t("common.copy")}
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="code-block-content">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
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
