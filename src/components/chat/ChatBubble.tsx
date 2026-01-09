import ReactMarkdown from "react-markdown";
import type { MessageItem } from "@/types";
import { Calendar, ExternalLink } from "lucide-react";
import { useScheduleStore } from "@/store";
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
    "[$2]($1)"
  );

  // 필요하다면 다른 태그 변환도 추가 가능 (예: <br> -> \n)
  markdown = markdown.replace(/<br\s*\/?>/g, "\n");

  return markdown;
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const { t } = useTranslation();
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
        {message.type === "schedule_result" ? (
          // 시간표 생성 결과 메시지 UI
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={20} className="text-green-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {t("schedule.status.complete")}
              </span>
            </div>
            <p className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
            {message.metadata?.scheduleCount && (
              <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
                {t("schedule.generated.subtitle", {
                  count: message.metadata.scheduleCount,
                })}
              </div>
            )}
            <button
              onClick={() => {
                const store = useScheduleStore.getState();

                // 메타데이터에서 스케줄 데이터 확인 (과거 기록 보기 지원)
                const schedulesInMeta = message.metadata?.schedules;

                if (
                  Array.isArray(schedulesInMeta) &&
                  schedulesInMeta.length > 0
                ) {
                  // 메타데이터가 있으면 무조건 해당 데이터로 복원 (히스토리 기능)
                  store.restoreSchedules(schedulesInMeta);
                } else {
                  // 메타데이터가 없으면(예전 데이터 등) 현재 스토어 상태 유지하며 뷰만 전환
                  store.switchToGeneratedView();
                }
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
