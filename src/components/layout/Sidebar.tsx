import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Settings,
  LogOut,
} from "lucide-react";
import { useUIStore, useChatStore, useAuthStore } from "@/store";

export const Sidebar = () => {
  const navigate = useNavigate();
  const {
    isSidebarOpen,
    setSidebarOpen,
    isMobile,
    openProfileModal,
    isProfileModalOpen,
  } = useUIStore();
  const {
    sessions,
    currentSessionId,
    selectSession,
    deleteSession,
    fetchSessions,
  } = useChatStore();
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  const handleSelectSession = async (sessionId: string) => {
    await selectSession(sessionId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string
  ) => {
    e.stopPropagation();
    await deleteSession(sessionId);
  };

  const handleRefresh = () => {
    fetchSessions();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - 사이드바가 닫혀있을 때만 표시 */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-sidebar"
        >
          <ChevronsRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Mobile Overlay - 클릭 영역만 (배경 없음) */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container - 애니메이션으로 너비 조절 */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          flex flex-col
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? isSidebarOpen
                ? "w-[80%] max-w-[320px] translate-x-0"
                : "w-0 -translate-x-full"
              : isSidebarOpen
              ? "w-[20%] min-w-[240px] max-w-[320px]"
              : "w-16"
          }
        `}
      >
        {/* 실제 사이드바 컨텐츠 */}
        <aside
          className={`
            h-full glass-sidebar border-r border-gray-100
            flex flex-col overflow-hidden
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Header - Logo & Toggle */}
          <div
            className={`
            flex items-center border-b border-gray-100 px-4 py-4
            transition-all duration-300
            ${isSidebarOpen ? "justify-between" : "justify-center"}
          `}
          >
            {/* Logo - 펼쳐졌을 때만 표시 */}
            <div
              className={`
              flex items-center gap-2 overflow-hidden
              transition-all duration-300
              ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}
            `}
            >
              <img
                src="/assets/images/logo.svg"
                alt="강냉봇 로고"
                className="h-6 w-auto"
              />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                gangnyeongbot
              </span>
            </div>

            {/* Toggle Button - 회전 애니메이션 */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 flex-shrink-0"
            >
              <div
                className={`transition-transform duration-300 ${
                  isSidebarOpen ? "" : "rotate-180"
                }`}
              >
                <ChevronsLeft size={20} />
              </div>
            </button>
          </div>

          {/* History Section - 펼쳐졌을 때만 표시 */}
          <div
            className={`
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${
              isSidebarOpen
                ? "flex-1 opacity-100 px-4 py-4"
                : "flex-none h-0 opacity-0 px-0 py-0"
            }
          `}
          >
            <div className="overflow-y-auto overflow-x-hidden h-full">
              {/* History Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 whitespace-nowrap"
                >
                  내 대화 모아보기
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      isHistoryOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleRefresh}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              {isHistoryOpen && (
                <div className="space-y-1">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">
                      아직 강냉봇과
                      <br />
                      나눈 대화가 없어요.
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.sid}
                        onClick={() => handleSelectSession(session.sid)}
                        className={`
                        w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left
                        transition-all duration-200 group
                        ${
                          currentSessionId === session.sid
                            ? "bg-primary-50 text-primary-600"
                            : "hover:bg-gray-50 text-gray-700"
                        }
                      `}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MessageSquare
                            size={14}
                            className="flex-shrink-0 opacity-60"
                          />
                          <span className="truncate text-sm">
                            {session.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(e, session.sid)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div
            className={`
            border-t border-gray-100
            transition-all duration-300 ease-in-out
            flex mt-auto relative
            ${
              isSidebarOpen
                ? "px-4 py-3 justify-start"
                : "px-0 py-3 justify-center"
            }
          `}
          >
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className={`
                flex items-center rounded-full
                transition-all duration-300 ease-in-out
                ${
                  isSidebarOpen
                    ? "w-full pl-2 pr-4 py-2 gap-3"
                    : "w-12 h-12 p-1 justify-center"
                }
                ${
                  isProfileModalOpen
                    ? "text-white shadow-lg"
                    : "glass-profile hover:shadow-lg"
                }
              `}
              style={
                isProfileModalOpen
                  ? {
                      background:
                        "radial-gradient(63.37% 63.37% at 50% 50%, #4E92FF 0%, rgba(78, 146, 255, 0.5) 100%)",
                      boxShadow: "0px 0px 40px 0px rgba(105, 162, 255, 0.24)",
                    }
                  : undefined
              }
            >
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0
                transition-colors duration-300 ease-in-out
                ${isProfileModalOpen ? "bg-white/20" : "bg-gray-100"}
              `}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className={`${
                      isProfileModalOpen ? "text-white" : "text-gray-400"
                    } w-8 h-8`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              {/* 이메일 - 펼쳐졌을 때만 표시 */}
              <span
                className={`
                text-sm truncate text-left
                transition-all duration-300 ease-in-out
                ${isProfileModalOpen ? "text-white" : "text-gray-600"}
                ${
                  isSidebarOpen
                    ? "opacity-100 flex-1"
                    : "opacity-0 w-0 overflow-hidden"
                }
              `}
              >
                {user?.email || profile?.profile_name || "hello@gmail.com"}
              </span>
            </button>

            {/* Popover */}
            {isPopoverOpen && (
              <div
                ref={popoverRef}
                className={`
                  absolute bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px]
                  animate-fade-in
                  ${
                    isSidebarOpen
                      ? "bottom-full left-2 mb-1"
                      : "left-full bottom-0 ml-2"
                  }
                `}
              >
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    openProfileModal();
                  }}
                  className="w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group"
                >
                  <Settings
                    size={18}
                    className="text-gray-500 group-hover:text-primary-500"
                  />
                  <span className="text-sm">설정</span>
                </button>
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors group"
                >
                  <LogOut
                    size={18}
                    className="text-gray-500 group-hover:text-primary-500"
                  />
                  <span className="text-sm">로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Main Content 영역을 위한 spacer (사이드바 닫혔을 때) */}
      {!isMobile && !isSidebarOpen && <div className="w-16 flex-shrink-0" />}
    </>
  );
};
