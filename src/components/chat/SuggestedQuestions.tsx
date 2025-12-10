import { useChatStore, useUIStore } from "@/store";

const SUGGESTED_QUESTIONS = [
  { id: "1", text: "오늘 급식 뭐야?" },
  { id: "2", text: "홍길동 교수님 수업 알려줘" },
  { id: "3", text: "행정실이 어디야?" },
];

// 모바일에서 비눗방울 레이아웃을 위한 위치 스타일 (컨테이너 기준)
const BUBBLE_POSITIONS = [
  "self-start", // 왼쪽
  "self-end", // 오른쪽
  "self-start ml-8", // 왼쪽 (더 들여쓰기)
];

export const SuggestedQuestions = () => {
  const { sendMessage, currentSessionId } = useChatStore();
  const { isMobile } = useUIStore();

  const handleQuestionClick = async (question: string) => {
    try {
      // 세션이 없으면 sendMessage에서 자동 생성 (낙관적 UI)
      await sendMessage(question, !currentSessionId);
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  return (
    <div
      className={`
      mt-5 w-full
      ${
        isMobile
          ? "flex flex-col items-center"
          : "flex flex-wrap justify-center gap-3 max-w-2xl"
      }
    `}
    >
      {isMobile ? (
        // 모바일: 고정 너비 컨테이너 안에서 비눗방울 레이아웃
        <div className="flex flex-col gap-3 w-full max-w-sm px-4">
          {SUGGESTED_QUESTIONS.map((q, index) => (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q.text)}
              className={`chip-suggestion ${BUBBLE_POSITIONS[index] || ""}`}
            >
              {q.text}
            </button>
          ))}
        </div>
      ) : (
        // 데스크톱: 기존 레이아웃
        SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => handleQuestionClick(q.text)}
            className="chip-suggestion"
          >
            {q.text}
          </button>
        ))
      )}
    </div>
  );
};
