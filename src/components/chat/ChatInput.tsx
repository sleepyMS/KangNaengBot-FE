import { useState, FormEvent, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore, useAuthStore } from "@/store";
import { AlertModal } from "@/components/common";

interface ChatInputProps {
  showNewChatButton?: boolean;
}

export const ChatInput = ({ showNewChatButton = false }: ChatInputProps) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const { sendMessage, isSending, currentSessionId } = useChatStore();
  const { isAuthenticated } = useAuthStore();

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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm hover:shadow-input hover:border-primary-300 transition-all"
              >
                새 대화 시작하기
                <Plus size={16} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center rounded-full overflow-hidden glass-input-container">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="무엇이든 물어보세요."
                rows={1}
                className="flex-1 px-6 py-4 resize-none outline-none text-gray-800 placeholder-gray-400 max-h-32 overflow-y-auto bg-transparent"
                style={{ minHeight: "56px" }}
              />
              <div className="pr-3">
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
