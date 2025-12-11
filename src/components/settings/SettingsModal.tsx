import { useState, useEffect, useRef } from "react";
import { X, User, Settings, Palette, Globe } from "lucide-react";
import { useUIStore } from "@/store";
import { useTranslation } from "react-i18next";
import { ProfileTab } from "./tabs/ProfileTab";
import { AccountTab } from "./tabs/AccountTab";
import { ThemeTab } from "./tabs/ThemeTab";
import { LanguageTab } from "./tabs/LanguageTab";

type TabId = "profile" | "account" | "theme" | "language";

interface Tab {
  id: TabId;
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
];

export const SettingsModal = () => {
  const { t } = useTranslation();
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
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
    setDragY(Math.max(0, delta));
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

  if (!isSettingsModalOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab isMobile={isMobile} />;
      case "account":
        return <AccountTab />;
      case "theme":
        return <ThemeTab />;
      case "language":
        return <LanguageTab />;
      default:
        return null;
    }
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={closeSettingsModal}
          style={{ opacity: Math.max(0.3, 1 - dragY / 300) }}
        />

        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className={`relative w-full max-h-[95vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-hidden ${
            isDragging
              ? ""
              : "animate-slide-up transition-transform duration-200"
          }`}
          style={{ transform: `translateY(${dragY}px)` }}
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

          {/* Tab Navigation - 가로 스크롤 유지, 스크롤바만 숨김 */}
          <div className="flex gap-2 px-4 pt-2 pb-4 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                `}
              >
                {tab.icon}
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Content - 스크롤 제거, 하단 safe area 여백 */}
          <div className="px-4 pb-8">{renderTabContent()}</div>
        </div>
      </div>
    );
  }

  // 데스크탑 레이아웃
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - 클릭하여 닫기 */}
      <div className="absolute inset-0" onClick={closeSettingsModal} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
        }}
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
          <div className="w-40 flex-shrink-0 p-6 border-r border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all
                    ${
                      activeTab === tab.id
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {tab.icon}
                  {t(tab.labelKey)}
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
