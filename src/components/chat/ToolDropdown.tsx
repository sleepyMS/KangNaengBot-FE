/**
 * 도구 드롭다운 컴포넌트
 * 시간표 만들기 등의 특수 기능 접근
 */
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, Mail } from "lucide-react";
import { useScheduleStore, useEmailStore } from "@/store";

interface ToolDropdownProps {
  disabled?: boolean;
}

export const ToolDropdown = ({ disabled = false }: ToolDropdownProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isScheduleMode, enterScheduleMode, exitScheduleMode } =
    useScheduleStore();
  const { isEmailMode, enterEmailMode, exitEmailMode } = useEmailStore();

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleScheduleClick = () => {
    if (isScheduleMode) {
      exitScheduleMode();
    } else {
      enterScheduleMode();
      // 이메일 모드가 켜져있다면 끄기
      if (isEmailMode) exitEmailMode();
    }
    setIsOpen(false);
  };

  const handleEmailClick = () => {
    if (isEmailMode) {
      exitEmailMode();
    } else {
      enterEmailMode();
      // 시간표 모드가 켜져있다면 끄기
      if (isScheduleMode) exitScheduleMode();
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* + 버튼 - 항상 + 아이콘, 열릴 때만 회전 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          transition-all duration-200
          ${
            isOpen
              ? "bg-primary-500 text-white rotate-45"
              : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        aria-label={t("chat.tools")}
      >
        <Plus size={20} />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-3 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-50 dropdown-animate"
          style={{ transformOrigin: "bottom left" }}
        >
          <div className="py-1">
            {/* 시간표 만들기 / 종료 */}
            <button
              onClick={handleScheduleClick}
              className={`
                w-full px-4 py-3 flex items-center gap-3 text-left
                transition-colors
                ${
                  isScheduleMode
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                }
              `}
            >
              <div
                className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${
                  isScheduleMode
                    ? "bg-primary-500 text-white"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }
              `}
              >
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {isScheduleMode
                    ? t("schedule.exitMode")
                    : t("schedule.createSchedule")}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isScheduleMode
                    ? t("schedule.exitModeDesc")
                    : t("schedule.createScheduleDesc")}
                </div>
              </div>
            </button>

            {/* 이메일 작성 / 종료 */}
            <button
              onClick={handleEmailClick}
              className={`
                w-full px-4 py-3 flex items-center gap-3 text-left
                transition-colors
                ${
                  isEmailMode
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                }
              `}
            >
              <div
                className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${
                  isEmailMode
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                }
              `}
              >
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {isEmailMode ? t("email.exitMode") : t("chat.feature.email")}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isEmailMode
                    ? t("email.exitModeDesc")
                    : t("chat.feature.emailDesc")}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
