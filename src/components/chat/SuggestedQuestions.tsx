import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChatStore, useUIStore } from "@/store";

// 질문 키 목록
const QUESTION_KEYS = [
  "food",
  "professor",
  "profLocation",
  "profEmail",
  "profSchedule",
  "deptPhone",
  "deptLocation",
  "graduation",
  "building",
  "majorCredits",
  "liberalCredits",
];

// Fisher-Yates 셔플 알고리즘으로 랜덤 선택
const getRandomQuestions = (keys: string[], count: number): string[] => {
  const shuffled = [...keys];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

const useSuggestedQuestions = () => {
  const { t, i18n } = useTranslation();

  // 언어가 변경되거나 컴포넌트가 마운트될 때만 새로운 랜덤 질문 선택
  const questions = useMemo(() => {
    const randomKeys = getRandomQuestions(QUESTION_KEYS, 3);
    return randomKeys.map((key, index) => ({
      id: String(index + 1),
      text: t(`chat.suggestions.${key}`),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]); // 언어 변경 시에만 재계산

  return questions;
};

// 모바일에서 비눗방울 레이아웃을 위한 위치 스타일 (컨테이너 기준)
const BUBBLE_POSITIONS = [
  "self-start", // 왼쪽
  "self-end", // 오른쪽
  "self-start ml-8", // 왼쪽 (더 들여쓰기)
];

export const SuggestedQuestions = () => {
  const { sendMessage, currentSessionId } = useChatStore();
  const { isMobile } = useUIStore();
  const questions = useSuggestedQuestions();

  const handleQuestionClick = async (question: string) => {
    try {
      // 세션이 없으면 sendMessage에서 자동 생성 (낙관적 UI)
      await sendMessage(question, { createSessionIfNeeded: !currentSessionId });
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
          {questions.map((q, index) => (
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
        questions.map((q) => (
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
