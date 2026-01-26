import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useModalHistory } from "@/hooks/useModalHistory";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "profile";
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 뒤로가기 제어 훅 적용
  useModalHistory(isOpen, onClose);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-xl",
    profile: "w-[60vw] max-w-[800px] min-w-[500px]",
  };

  const isProfileModal = size === "profile";

  // 모바일 뷰 - 바텀 시트 스타일
  if (isMobile && isProfileModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />

        {/* Bottom Sheet Modal */}
        <div
          className="relative w-full animate-slide-up bg-white dark:bg-slate-900 rounded-t-3xl"
          style={{
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            maxHeight: "85vh",
            boxShadow: "0px -4px 40px 0px rgba(105, 162, 255, 0.24)",
          }}
        >
          {/* 타이틀 - 중앙 정렬 */}
          <div className="text-center py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              프로필
            </h2>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div
            className="overflow-y-auto overflow-x-hidden px-5 py-4"
            style={{ maxHeight: "calc(85vh - 80px)" }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // 데스크탑 뷰 - 기존 모달
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - 투명 (클릭 시 닫기용) */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal - 글래스모피즘 스타일 */}
      <div
        className={`
          relative w-full ${sizes[size]} 
          animate-slide-up transform glass
        `}
        style={{
          boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
          borderRadius: "32px",
          ...(isProfileModal && { minHeight: "500px" }),
        }}
      >
        {/* Close Button - 우상단 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className={`p-8 ${isProfileModal ? "pt-10" : ""}`}>
          {/* Title - profile 모달의 경우 왼쪽에 별도 배치 */}
          {title && !isProfileModal && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
