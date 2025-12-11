import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
  resetTrigger?: boolean; // 외부에서 상태 리셋을 트리거할 때 사용 (예: 사이드바 닫힘)
}

const SWIPE_THRESHOLD = 60; // 삭제 버튼이 고정되는 임계값 (px)
const DELETE_BUTTON_WIDTH = 70; // 삭제 버튼 너비 (px)

export const SwipeableItem = ({
  children,
  onDelete,
  disabled = false,
  resetTrigger,
}: SwipeableItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const translateXRef = useRef(0); // 현재 translateX 값을 추적하는 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // resetTrigger가 false가 되면 (사이드바가 닫히면) 상태 초기화
  useEffect(() => {
    if (resetTrigger === false) {
      setTranslateX(0);
      translateXRef.current = 0;
      setIsOpen(false);
      setIsDragging(false);
    }
  }, [resetTrigger]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      startXRef.current = e.touches[0].clientX;
      currentXRef.current = translateX;
      setIsDragging(true);
    },
    [disabled, translateX]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !isDragging) return;

      const currentX = e.touches[0].clientX;
      const diff = startXRef.current - currentX;
      let newTranslateX = currentXRef.current + diff;

      // 오른쪽으로는 스와이프 불가 (원래 위치 이상)
      if (newTranslateX < 0) {
        newTranslateX = 0;
      }

      // 최대 스와이프 거리 제한
      if (newTranslateX > DELETE_BUTTON_WIDTH) {
        // 저항감 있는 스와이프 (탄성 효과)
        newTranslateX =
          DELETE_BUTTON_WIDTH + (newTranslateX - DELETE_BUTTON_WIDTH) * 0.3;
      }

      translateXRef.current = newTranslateX; // ref 업데이트
      setTranslateX(newTranslateX);
    },
    [disabled, isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;

    setIsDragging(false);

    // ref에서 현재 값을 읽어 즉시 판단
    const currentTranslateX = translateXRef.current;

    if (currentTranslateX > SWIPE_THRESHOLD) {
      // 임계값 초과 시 삭제 버튼 고정
      setTranslateX(DELETE_BUTTON_WIDTH);
      translateXRef.current = DELETE_BUTTON_WIDTH;
      setIsOpen(true);
    } else {
      // 임계값 미달 시 원래 위치로 복귀
      setTranslateX(0);
      translateXRef.current = 0;
      setIsOpen(false);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setTranslateX(0);
    translateXRef.current = 0;
    setIsOpen(false);
  }, []);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDelete();
      handleClose();
    },
    [onDelete, handleClose]
  );

  // 컨텐츠 클릭 시 열린 상태면 닫기
  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      if (isOpen) {
        e.stopPropagation();
        handleClose();
      }
    },
    [isOpen, handleClose]
  );

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* 삭제 버튼 배경 */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 transition-opacity z-10"
        style={{ width: DELETE_BUTTON_WIDTH }}
      >
        <button
          onClick={handleDeleteClick}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDeleteClick(e);
          }}
          className="flex items-center justify-center w-full h-full text-white active:bg-red-600"
          aria-label="삭제"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* 스와이프 가능한 컨텐츠 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
        className="relative bg-white dark:bg-slate-900 z-20"
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* children을 overflow hidden으로 감싸서 텍스트 잘림 유지 */}
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
