import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { SettingsModal } from "@/components/settings";
import { LanguageSwitcher } from "@/components/common";
import { useUIStore } from "@/store";
import { MessageSquarePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { t } = useTranslation();
  const { setIsMobile, isMobile, isSidebarOpen, openSettingsModal } =
    useUIStore();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile]);

  // 모바일에서 채팅 세션 페이지(/chat/...)일 때는 언어 전환 버튼 숨김
  const isChatSession = location.pathname.startsWith("/chat/");
  const showLanguageSwitcher = !(isMobile && isChatSession);

  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-900 transition-colors">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* 우측 상단 버튼들 */}
        <div
          className={`
            absolute top-4 z-30 transition-all duration-300
            ${isMobile ? "right-4" : isSidebarOpen ? "right-4" : "right-4"}
            flex items-center gap-2
          `}
        >
          {/* 피드백 버튼 */}
          <button
            onClick={() => openSettingsModal("feedback")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-sidebar text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all hover:scale-105 active:scale-95 text-sm font-medium"
          >
            <MessageSquarePlus size={18} />
            <span>{t("settings.tabs.feedback")}</span>
          </button>
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
        {children}
      </main>
      <SettingsModal />
    </div>
  );
};
