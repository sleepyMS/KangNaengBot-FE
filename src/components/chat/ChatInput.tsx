import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useChatStore,
  useAuthStore,
  useScheduleStore,
  useUIStore,
  useEmailStore,
} from "@/store";
import { AlertModal } from "@/components/common";
import { ToolDropdown } from "./ToolDropdown";

interface ChatInputProps {
  showNewChatButton?: boolean;
}

// 한 줄 기준 높이 (56px = minHeight)
const SINGLE_LINE_HEIGHT = 56;
// 최대 높이 (약 6줄 정도)
const MAX_HEIGHT = 180;

export const ChatInput = ({ showNewChatButton = false }: ChatInputProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isSending, currentSessionId } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { isMobile } = useUIStore();
  const { isScheduleMode, exitScheduleMode, status } = useScheduleStore();
  const { isEmailMode, exitEmailMode } = useEmailStore();

  // 시간표 모드 로딩 상태
  const isScheduleLoading = status === "parsing" || status === "generating";

  // 텍스트 변경 시 높이와 border-radius 동시 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    const buttonContainer = buttonContainerRef.current;
    if (!textarea || !container || !buttonContainer) return;

    // scrollHeight 측정을 위해 일시적으로 auto
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
    const targetHeight = Math.max(newHeight, SINGLE_LINE_HEIGHT);
    const isMulti = scrollHeight > SINGLE_LINE_HEIGHT + 8;

    // 높이와 border-radius를 동시에 적용
    // 핵심: 9999px 대신 실제 높이 기반 값 사용 (28px ↔ 16px 범위)
    textarea.style.height = `${targetHeight}px`;
    container.style.borderRadius = isMulti ? "1rem" : `${targetHeight / 2}px`;

    // 버튼 정렬: 한 줄일 때 중앙, 여러 줄일 때 하단 + 패딩
    buttonContainer.style.alignSelf = isMulti ? "flex-end" : "center";
    buttonContainer.style.paddingBottom = isMulti ? "0.75rem" : "0";
  }, [message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || isScheduleLoading) return;

    const trimmedMessage = message.trim();
    setMessage("");

    // 게스트 쿼터 체크 (클라이언트 사이드)
    // 메시지가 3개(왕복 아님) 이상이면 차단
    if (!isAuthenticated) {
      const currentMessages = useChatStore.getState().messages;
      const userMessageCount = currentMessages.filter(
        (m) => m.role === "user",
      ).length;
      if (userMessageCount >= 3) {
        useChatStore.getState().setError("GUEST_QUOTA_EXCEEDED");
        return;
      }
    }

    // 통합된 sendMessage 호출 - 모드에 따라 mode 파라미터만 다름
    await sendMessage(trimmedMessage, {
      createSessionIfNeeded: !currentSessionId,
      mode: isScheduleMode ? "schedule" : isEmailMode ? "email" : "chat",
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중이면 Enter 키 무시 (macOS 한글/일본어/중국어 입력 문제 해결)
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = () => {
    // 게스트 모드면 로그인 유도 모달 표시
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }
    // 세션 생성하지 않고, 현재 세션만 초기화
    // 실제 세션은 첫 메시지 전송 시 생성됨 (handleSubmit에서 처리)
    useChatStore.getState().clearCurrentSession();
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    navigate("/login");
  };

  return (
    <>
      <div className="p-4 pb-6 w-full">
        <div className="w-full max-w-4xl mx-auto relative z-0">
          {/* New Chat Button - Slides up from behind input */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 -z-10 transition-all duration-300 ease-out ${
              showNewChatButton
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            <button
              onClick={handleNewChat}
              className="new-chat-btn inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:scale-105 transition-all"
            >
              {t("chat.newChat")}
              <Plus size={16} />
            </button>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit}>
            <div
              ref={containerRef}
              className="relative flex items-center glass-input-container"
              style={{
                borderRadius: `${SINGLE_LINE_HEIGHT / 2}px`,
                transition: "border-radius 0.2s ease-out",
              }}
            >
              {/* Tool Dropdown Button */}
              <div className="pl-3">
                <ToolDropdown disabled={isSending} />
              </div>

              {/* Schedule Mode Chip */}
              {isScheduleMode && (
                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 ml-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium flex-shrink-0">
                  <Calendar size={14} />
                  <span className="hidden md:inline">
                    {t("schedule.createSchedule")}
                  </span>
                  <button
                    type="button"
                    onClick={exitScheduleMode}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors"
                    aria-label={t("schedule.exitMode")}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Email Mode Chip */}
              {isEmailMode && (
                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 ml-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium flex-shrink-0">
                  <span className="hidden md:inline">
                    {t("email.modeActive")}
                  </span>
                  <button
                    type="button"
                    onClick={exitEmailMode}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                    aria-label={t("email.exitMode")}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isScheduleMode
                    ? isMobile
                      ? t("schedule.inputPlaceholderShort")
                      : t("schedule.inputPlaceholder")
                    : isEmailMode
                      ? t("email.inputPlaceholder")
                      : t("chat.placeholder")
                }
                rows={1}
                className="flex-1 px-3 py-4 resize-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 overflow-y-auto bg-transparent"
                style={{
                  minHeight: `${SINGLE_LINE_HEIGHT}px`,
                  maxHeight: `${MAX_HEIGHT}px`,
                  transition: "height 0.15s ease-out",
                }}
              />
              <div
                ref={buttonContainerRef}
                className="pr-3 flex items-center"
                style={{
                  transition: "margin-top 0.2s ease-out",
                }}
              >
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className={`
                    btn-send
                    ${
                      !message.trim() || isSending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <img
                      src="/assets/images/subtract.svg"
                      alt={t("chat.send")}
                      className="w-[17px] h-[18px]"
                    />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 게스트 로그인 유도 모달 */}
      <AlertModal
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={handleLoginConfirm}
        type="info"
        title={t("chat.loginRequired")}
        message={t("chat.loginRequiredDesc")}
        confirmText={t("chat.login")}
        cancelText={t("common.cancel")}
      />
    </>
  );
};
