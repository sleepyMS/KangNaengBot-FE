import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const WelcomeScreen = () => {
  const { t } = useTranslation();

  const messages = useMemo(() => {
    return (t("welcome.messages", { returnObjects: true }) as string[]) || [];
  }, [t]);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // 커서 깜빡임 효과
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // 타이핑 애니메이션
  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];

    if (isTyping) {
      // 타이핑 중
      if (displayedText.length < currentMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50); // 타이핑 속도
        return () => clearTimeout(timeout);
      } else {
        // 타이핑 완료, 잠시 대기 후 다음 문장으로
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000); // 문장 표시 유지 시간
        return () => clearTimeout(timeout);
      }
    } else {
      // 다음 문장으로 전환
      const nextIndex = (currentMessageIndex + 1) % messages.length;
      const timeout = setTimeout(() => {
        setDisplayedText("");
        setCurrentMessageIndex(nextIndex);
        setIsTyping(true);
      }, 1200); // 전환 대기 시간
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isTyping, currentMessageIndex]);

  return (
    <div className="text-center mb-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed min-h-[2em]">
        {displayedText}
        <span
          className={`inline-block w-0.5 h-7 md:h-8 bg-primary-500 ml-1 align-middle transition-opacity duration-100 ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        />
      </h1>
    </div>
  );
};
