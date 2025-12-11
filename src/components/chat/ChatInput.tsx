import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore, useAuthStore } from "@/store";
import { AlertModal } from "@/components/common";

interface ChatInputProps {
  showNewChatButton?: boolean;
}

// 한 줄 기준 높이 (56px = minHeight)
const SINGLE_LINE_HEIGHT = 56;
// 최대 높이 (약 6줄 정도)
const MAX_HEIGHT = 180;

export const ChatInput = ({ showNewChatButton = false }: ChatInputProps) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isSending, currentSessionId } = useChatStore();
  const { isAuthenticated } = useAuthStore();

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
    if (!message.trim() || isSending) return;

    const trimmedMessage = message.trim();
    setMessage("");

    // 세션이 없으면 sendMessage에서 자동 생성 (낙관적 UI)
    await sendMessage(trimmedMessage, !currentSessionId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        <div className="w-full max-w-4xl mx-auto space-y-3">
          {/* New Chat Button */}
          {showNewChatButton && (
            <div className="flex justify-center">
              <button
                onClick={handleNewChat}
                className="new-chat-btn inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-gray-300 shadow-sm transition-all"
              >
                새 대화 시작하기
                <Plus size={16} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit}>
            <div
              ref={containerRef}
              className="relative flex items-end glass-input-container overflow-hidden"
              style={{
                borderRadius: `${SINGLE_LINE_HEIGHT / 2}px`,
                transition: "border-radius 0.2s ease-out",
              }}
            >
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="무엇이든 물어보세요."
                rows={1}
                className="flex-1 px-6 py-4 resize-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 overflow-y-auto bg-transparent"
                style={{
                  minHeight: `${SINGLE_LINE_HEIGHT}px`,
                  maxHeight: `${MAX_HEIGHT}px`,
                  transition: "height 0.15s ease-out",
                }}
              />
              <div
                ref={buttonContainerRef}
                className="pr-3 flex items-center self-center"
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
                      alt="전송"
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
        title="로그인이 필요해요"
        message={
          <>
            새 대화를 시작하려면 로그인이 필요합니다.
            <br />
            로그인하면 대화 기록도 저장할 수 있어요!
          </>
        }
        confirmText="로그인하기"
        cancelText="취소"
      />
    </>
  );
};
