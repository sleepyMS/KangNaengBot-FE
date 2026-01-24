import { useState, useEffect, useRef } from "react";
import { X, User, Settings, Palette, Globe, MessageSquare } from "lucide-react";
import { useUIStore, SettingsTabId } from "@/store";
import { useTranslation } from "react-i18next";
import { ProfileTab } from "./tabs/ProfileTab";
import { AccountTab } from "./tabs/AccountTab";
import { ThemeTab } from "./tabs/ThemeTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { FeedbackTab } from "./tabs/FeedbackTab";

interface Tab {
  id: SettingsTabId;
  labelKey: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: "profile",
    labelKey: "settings.tabs.profile",
    icon: <User size={18} />,
  },
  {
    id: "account",
    labelKey: "settings.tabs.account",
    icon: <Settings size={18} />,
  },
  { id: "theme", labelKey: "settings.tabs.theme", icon: <Palette size={18} /> },
  {
    id: "language",
    labelKey: "settings.tabs.language",
    icon: <Globe size={18} />,
  },
  {
    id: "feedback",
    labelKey: "settings.tabs.feedback",
    icon: <MessageSquare size={18} />,
  },
];

export const SettingsModal = () => {
  const { t } = useTranslation();
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    activeSettingsTab,
    setActiveSettingsTab,
  } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  // 드래그 상태
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettingsModal();
    };
    if (isSettingsModalOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isSettingsModalOpen, closeSettingsModal]);

  // 모달 열릴 때 드래그 상태 초기화
  useEffect(() => {
    if (isSettingsModalOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isSettingsModalOpen]);

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    // 아래로만 드래그 가능 (delta > 0)
    // 저항감 추가 (Rubber band effect) - 실제 이동거리보다 적게 움직이게
    const dampening = 1; // 1:1 이동
    setDragY(Math.max(0, delta * dampening));
  };

  // 드래그 끝
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // 100px 이상 드래그하면 닫기
    if (dragY > 100) {
      closeSettingsModal();
    }
    setDragY(0);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // 부모 컴포넌트에서 항상 렌더링(mount) 하므로, CSS로 visibility와 transition을 제어합니다.
  // if (!isSettingsModalOpen) return null; <- 삭제됨

  const renderTabContent = () => {
    switch (activeSettingsTab) {
      case "profile":
        return <ProfileTab isMobile={isMobile} />;
      case "account":
        return <AccountTab />;
      case "theme":
        return <ThemeTab />;
      case "language":
        return <LanguageTab />;
      case "feedback":
        return <FeedbackTab />;
      default:
        return null;
    }
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${
          isSettingsModalOpen ? "visible" : "invisible delay-300"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isSettingsModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSettingsModal}
          style={{
            opacity: isSettingsModalOpen ? 1 - Math.min(dragY / 300, 1) : 0,
          }}
        />

        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className={`relative w-full max-h-[95vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-hidden 
          ${
            isSettingsModalOpen && !isDragging
              ? "translate-y-0"
              : isSettingsModalOpen && isDragging
                ? "" // 드래그 중에는 transform 스타일이 제어함
                : "translate-y-full pointer-events-none" // 닫힘
          }
          ${
            isDragging
              ? "transition-none" // 드래그 중에는 즉각 반응
              : "transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)" // 놓거나 닫을 때는 스무스
          }`}
          style={{
            transform:
              isSettingsModalOpen && isDragging
                ? `translateY(${dragY}px)`
                : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Drag Handle - 드래그 가능 영역 */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Tab Navigation - 중앙 정렬 */}
          <div className="flex justify-center w-full border-b border-gray-100 dark:border-slate-800">
            <div className="flex gap-2 px-4 pt-4 pb-4 overflow-x-auto scrollbar-hide max-w-full">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                  ${
                    activeSettingsTab === tab.id
                      ? "bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }
                `}
                >
                  {tab.icon}
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Content - 중앙 정렬 */}
          <div className="px-4 pt-4 pb-8 flex flex-col items-center w-full">
            <div className="w-full max-w-md">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    );
  }

  // 데스크탑 레이아웃
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isSettingsModalOpen ? "visible" : "invisible delay-200"
      }`}
    >
      {/* Backdrop - 클릭하여 닫기 */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isSettingsModalOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeSettingsModal}
      />

      {/* Modal */}
      <div
        className={`relative w-[95%] md:w-[90%] lg:w-[80%] max-w-3xl rounded-2xl overflow-hidden glass-modal transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1) ${
          isSettingsModalOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeSettingsModal}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex min-h-[400px]">
          {/* Left Sidebar - Tab List */}
          <div className="w-56 flex-shrink-0 p-6 border-r border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all
                    ${
                      activeSettingsTab === tab.id
                        ? "bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  <span className="truncate">{t(tab.labelKey)}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};
