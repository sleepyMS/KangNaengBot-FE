import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
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
  LogIn,
  Plus,
  MessageSquarePlus,
} from "lucide-react";
import { useUIStore, useChatStore, useAuthStore, useToastStore } from "@/store";
import { authService } from "@/api";
import { AlertModal, Spinner } from "@/components/common";
import { SavedScheduleList } from "@/components/schedule/SavedScheduleList";
import { UNIVERSITY_TRANS_KEYS } from "@/constants/universityTranslation";

export const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isSidebarOpen,
    setSidebarOpen,
    isMobile,
    openProfileModal,
    isProfileModalOpen,
    openSettingsModal,
  } = useUIStore();
  const {
    sessions,
    currentSessionId,
    prefetchSession,
    deleteSession,
    deleteAllSessions,
    fetchSessions,
    clearCurrentSession,
    isLoading: isSessionsLoading,
  } = useChatStore();
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isSavedSchedulesOpen, setIsSavedSchedulesOpen] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [isNewChatMenuOpen, setIsNewChatMenuOpen] = useState(false);
  const [newChatMenuPos, setNewChatMenuPos] = useState({
    top: 0,
    left: 0,
    right: 0,
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);
  const newChatMenuRef = useRef<HTMLDivElement>(null);
  const newChatBtnRef = useRef<HTMLButtonElement>(null);
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
      if (
        historyMenuRef.current &&
        !historyMenuRef.current.contains(event.target as Node)
      ) {
        setIsHistoryMenuOpen(false);
      }
      if (
        newChatMenuRef.current &&
        !newChatMenuRef.current.contains(event.target as Node)
      ) {
        setIsNewChatMenuOpen(false);
      }
    };
    if (isPopoverOpen || isHistoryMenuOpen || isNewChatMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen, isHistoryMenuOpen, isNewChatMenuOpen]);

  const toggleNewChatMenu = () => {
    if (!isNewChatMenuOpen && newChatBtnRef.current) {
      const rect = newChatBtnRef.current.getBoundingClientRect();
      setNewChatMenuPos({
        top: rect.bottom + 8, // 버튼 아래에 약간의 여백
        left: 0, // left는 사용하지 않음 (right 정렬)
        right: window.innerWidth - rect.right, // 오른쪽 기준 정렬
      });
    }
    setIsNewChatMenuOpen(!isNewChatMenuOpen);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  const handleSelectSession = async (sessionId: string) => {
    // 클릭 시 대기 중인 프리페치 타이머 취소
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
    // URL 네비게이션으로 세션 선택 (ChatPage에서 URL 변경 감지하여 처리)
    navigate(`/chat/${sessionId}`);
    if (isMobile) setSidebarOpen(false);
  };

  // 디바운스된 프리페칭 (200ms 후 실행)
  const handleMouseEnterSession = (sessionId: string) => {
    // 기존 타이머 취소
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }
    // 200ms 후 프리페칭 실행
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchSession(sessionId);
      prefetchTimeoutRef.current = null;
    }, 200);
  };

  const handleMouseLeaveSession = () => {
    // 마우스가 떠나면 타이머 취소
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeleteTargetId(sessionId);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      // 낙관적 UI: 모달 먼저 닫고 삭제 실행
      const targetId = deleteTargetId;
      setDeleteTargetId(null);
      deleteSession(targetId);
      addToast("success", t("sidebar.deleteSuccess"));
    }
  };

  const handleRefresh = () => {
    fetchSessions();
  };

  const handleDeleteAllClick = () => {
    setIsHistoryMenuOpen(false);
    setIsDeleteAllModalOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeleteAllModalOpen(false);
    await deleteAllSessions();
    addToast("success", t("sidebar.deleteAllSuccess"));
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
                ? "w-[clamp(240px,80%,320px)] translate-x-0"
                : "w-[clamp(240px,80%,320px)] -translate-x-full"
              : isSidebarOpen
                ? "w-[clamp(240px,20vw,320px)]"
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
          <div className="flex items-center border-b border-gray-100 px-4 py-4">
            {/* Logo - 고정 레이아웃, 사이드바 접히면 잘려나감 */}
            <div
              className={`
              flex items-center gap-1 overflow-hidden whitespace-nowrap flex-1 min-w-0
              transition-opacity duration-300
              ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
            >
              <img
                src="/assets/images/logo.svg"
                alt="강냉봇 로고"
                className="h-9 w-auto flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap leading-none">
                kangnaengbot
              </span>
            </div>

            {/* Toggle Button - 회전 애니메이션 */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 flex-shrink-0"
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

          {/* History Section - 콘텐츠는 고정 크기, 사이드바가 줄어들면 잘려나감 */}
          <div
            className={`
            flex-1 overflow-hidden
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          >
            <div className="overflow-y-auto overflow-x-hidden h-full min-w-[200px] px-4 py-4">
              {/* History Header - 고정 레이아웃으로 너비 변화에도 여백 유지 */}
              <div className="flex items-center justify-between mb-3 gap-2">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap flex-shrink-0"
                >
                  {t("sidebar.history")}
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${
                      isHistoryOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 relative">
                  {/* New Chat Button */}
                  <div className="relative">
                    <button
                      ref={newChatBtnRef}
                      onClick={toggleNewChatMenu}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    {isNewChatMenuOpen &&
                      createPortal(
                        <div
                          ref={newChatMenuRef}
                          style={{
                            top: `${newChatMenuPos.top}px`,
                            right: `${newChatMenuPos.right}px`,
                          }}
                          className="fixed glass-modal rounded-xl py-2 min-w-[150px] z-[9999] animate-fade-in"
                        >
                          <button
                            onClick={() => {
                              setIsNewChatMenuOpen(false);
                              if (isMobile) setSidebarOpen(false);

                              // 게스트 모드면 로그인 유도
                              if (!isAuthenticated) {
                                setIsLoginAlertOpen(true);
                                return;
                              }

                              clearCurrentSession();
                              navigate("/");
                            }}
                            className="w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors group"
                          >
                            <MessageSquarePlus
                              size={16}
                              className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                            />
                            <span className="text-sm">
                              {t("sidebar.newChat")}
                            </span>
                          </button>
                        </div>,
                        document.body,
                      )}
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => setIsHistoryMenuOpen(!isHistoryMenuOpen)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors relative"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {/* History Menu Dropdown */}
                  {isHistoryMenuOpen && (
                    <div
                      ref={historyMenuRef}
                      className="absolute top-full right-0 mt-1 glass-modal rounded-xl py-2 min-w-[160px] z-50 animate-fade-in"
                    >
                      <button
                        onClick={handleDeleteAllClick}
                        disabled={sessions.length === 0}
                        className="w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">
                          {t("sidebar.deleteAll")}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sessions List */}
              {isHistoryOpen && (
                <div className="space-y-1">
                  {!isAuthenticated ? (
                    // 게스트 모드: 로그인 유도
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-center overflow-hidden">
                      <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="whitespace-nowrap overflow-hidden">
                          {t("sidebar.guestGuideLine1")}
                        </span>
                        <span className="whitespace-nowrap overflow-hidden">
                          {t("sidebar.guestGuideLine2")}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          // 네이티브 앱이면 바로 네이티브 로그인, 아니면 /login 페이지로
                          if (!authService.requestNativeLogin()) {
                            navigate("/login");
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-white rounded-full transition-all hover:scale-105 active:scale-95"
                        style={{
                          background:
                            "radial-gradient(63.37% 63.37% at 50% 50%, #4E92FF 0%, rgba(78, 146, 255, 0.5) 100%)",
                          boxShadow:
                            "0px 0px 24px 0px rgba(105, 162, 255, 0.24)",
                        }}
                      >
                        {t("chat.login")}
                      </button>
                    </div>
                  ) : sessions.length === 0 ? (
                    isSessionsLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Spinner size="md" />
                        <span className="text-xs text-gray-400">
                          {t("common.loading")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 py-4 whitespace-nowrap overflow-hidden text-center">
                        {t("sidebar.noHistory")}
                      </p>
                    )
                  ) : (
                    sessions.map((session) => {
                      // 세션 아이템 공통 컨텐츠
                      const sessionContent = (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectSession(session.sid)}
                          onMouseEnter={() =>
                            handleMouseEnterSession(session.sid)
                          }
                          onMouseLeave={handleMouseLeaveSession}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectSession(session.sid);
                            }
                          }}
                          className={`
                            w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left
                            transition-all duration-200 group cursor-pointer border
                            ${
                              currentSessionId === session.sid
                                ? "bg-gradient-to-r from-primary-500 to-blue-600 text-white border-primary-400 shadow-lg"
                                : "border-transparent hover:bg-[rgba(78,146,255,0.3)] dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300"
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
                          {/* 데스크톱: 호버 시 삭제 버튼 표시 */}
                          {!isMobile && (
                            <button
                              onClick={(e) => handleDeleteClick(e, session.sid)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          {/* 모바일: 항상 표시되는 더보기 버튼 */}
                          {isMobile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(e, session.sid);
                              }}
                              className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                                currentSessionId === session.sid
                                  ? "hover:bg-white/20 text-white/70 hover:text-white"
                                  : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
                              }`}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          )}
                        </div>
                      );

                      return <div key={session.sid}>{sessionContent}</div>;
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Saved Schedules Section */}
          <div
            className={`
            flex-1 overflow-hidden border-t border-gray-100
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          >
            <div className="overflow-y-auto overflow-x-hidden h-full min-w-[200px] px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setIsSavedSchedulesOpen(!isSavedSchedulesOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap flex-shrink-0"
                >
                  {t("schedule.viewSaved")}
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${
                      isSavedSchedulesOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>
              </div>

              {isSavedSchedulesOpen && <SavedScheduleList />}
            </div>
          </div>

          {/* Legal Links - 사이드바 펼쳐졌을 때만 표시 */}
          <div
            className={`
              px-4 pb-2 overflow-hidden
              transition-opacity duration-300 ease-in-out
              ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap min-w-[200px]">
              <Link
                to="/terms"
                className="hover:text-gray-600 transition-colors"
              >
                {t("common.terms")}
              </Link>
              <span>•</span>
              <Link
                to="/privacy"
                className="hover:text-gray-600 transition-colors"
              >
                {t("common.privacy")}
              </Link>
            </div>
          </div>

          {/* User Profile */}
          <div
            className={`
            border-t border-gray-100
            transition-all duration-300 ease-in-out
            flex mt-auto relative items-center
            h-[72px]
            ${isSidebarOpen ? "px-4 justify-start" : "px-0 justify-center"}
          `}
          >
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className={`
                user-profile-btn flex items-center rounded-full border border-transparent
                transition-all duration-300 ease-in-out
                h-14
                ${
                  isSidebarOpen
                    ? "w-full pl-2 pr-4 gap-3"
                    : "w-14 p-1 justify-center"
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
                      borderColor: "transparent",
                    }
                  : undefined
              }
            >
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0
                transition-colors duration-300 ease-in-out
                ${
                  isProfileModalOpen
                    ? "bg-white/20"
                    : "bg-gray-100 dark:bg-gray-700"
                }
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
                    } w-8 h-8 transition-colors duration-300`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              {/* 이메일 - 펼쳐졌을 때만 표시 */}
              <div
                className={`
                flex flex-col text-left overflow-hidden
                transition-all duration-300 ease-in-out
                ${isProfileModalOpen ? "text-white" : "text-gray-600"}
                ${
                  isSidebarOpen
                    ? "opacity-100 flex-1"
                    : "opacity-0 w-0 overflow-hidden"
                }
              `}
              >
                {profile?.profile_name ? (
                  <div className="flex flex-col min-w-0">
                    {/* 전공 */}
                    {profile.major && (
                      <span className="text-xs opacity-70 truncate mb-0.5">
                        {UNIVERSITY_TRANS_KEYS[profile.major]
                          ? t(UNIVERSITY_TRANS_KEYS[profile.major])
                          : profile.major}
                      </span>
                    )}
                    {/* 학번 & 이름 */}
                    <div className="flex items-center gap-1.5 truncate">
                      {profile.student_id && (
                        <span className="text-sm font-normal opacity-80 flex-shrink-0">
                          {profile.student_id}
                        </span>
                      )}
                      <span className="text-sm font-medium truncate">
                        {profile.profile_name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm truncate">
                    {user?.email || "hello@gmail.com"}
                  </span>
                )}
              </div>
            </button>

            {/* Popover */}
            {isPopoverOpen && (
              <div
                ref={popoverRef}
                className={`
                  absolute glass-modal rounded-xl py-2 min-w-[140px] z-50
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
                  className="popover-item w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 transition-colors group"
                >
                  <Settings
                    size={18}
                    className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500"
                  />
                  <span className="text-sm">{t("settings.title")}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    openSettingsModal("feedback");
                  }}
                  className="popover-item w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 transition-colors group"
                >
                  <MessageSquarePlus
                    size={18}
                    className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500"
                  />
                  <span className="text-sm">{t("settings.tabs.feedback")}</span>
                </button>
                <button
                  onClick={async () => {
                    setIsPopoverOpen(false);
                    if (!isAuthenticated) {
                      // 네이티브 앱이면 바로 네이티브 로그인, 아니면 /login 페이지로
                      if (!authService.requestNativeLogin()) {
                        navigate("/login");
                      }
                      return;
                    }
                    await logout();
                    if (!isMobile) {
                      addToast("success", t("auth.logoutSuccess"));
                    }
                    navigate("/login");
                  }}
                  className="popover-item w-[calc(100%-8px)] mx-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-50 transition-colors group"
                >
                  {!isAuthenticated ? (
                    <LogIn
                      size={18}
                      className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500"
                    />
                  ) : (
                    <LogOut
                      size={18}
                      className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500"
                    />
                  )}
                  <span className="text-sm">
                    {!isAuthenticated
                      ? t("settings.account.login")
                      : t("settings.account.logout")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Main Content 영역을 위한 spacer (사이드바 닫혔을 때) */}
      {!isMobile && !isSidebarOpen && <div className="w-16 flex-shrink-0" />}

      {/* 삭제 확인 모달 */}
      <AlertModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        type="warning"
        title={t("sidebar.deleteConfirm")}
        message={t("sidebar.deleteWarning")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />

      {/* 일괄 삭제 확인 모달 */}
      <AlertModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        type="warning"
        title={t("sidebar.deleteAllConfirm")}
        message={t("sidebar.deleteAllWarning")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      />

      {/* 게스트 로그인 유도 모달 */}
      <AlertModal
        isOpen={isLoginAlertOpen}
        onClose={() => setIsLoginAlertOpen(false)}
        onConfirm={() => {
          setIsLoginAlertOpen(false);
          if (!authService.requestNativeLogin()) {
            navigate("/login");
          }
        }}
        type="info"
        title={t("chat.loginRequired")}
        message={t("chat.loginRequiredDesc")}
        confirmText={t("chat.login")}
        cancelText={t("common.cancel")}
      />
    </>
  );
};
