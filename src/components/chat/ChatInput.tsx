import { useState, FormEvent, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useChatStore } from "@/store";

interface ChatInputProps {
  showNewChatButton?: boolean;
}

export const ChatInput = ({ showNewChatButton = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { sendMessage, isSending, currentSessionId, createSession } =
    useChatStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const trimmedMessage = message.trim();
    setMessage("");

    let sessionId = currentSessionId;

    // 세션이 없으면 새로 생성
    if (!sessionId) {
      try {
        sessionId = await createSession();
      } catch {
        // 세션 생성 실패 시 에러는 store에서 처리됨
        return;
      }
    }

    await sendMessage(trimmedMessage);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = async () => {
    await createSession();
  };

  return (
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
  );
};
