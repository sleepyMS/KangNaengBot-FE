/**
 * 시간표 모드 인디케이터
 * 시간표 모드 활성화 시 화면 상단에 표시
 */
import { useTranslation } from "react-i18next";
import { Calendar, X } from "lucide-react";
import { useScheduleStore } from "@/store";

export const ScheduleModeIndicator = () => {
  const { t } = useTranslation();
  const { isScheduleMode, status, exitScheduleMode, filters } =
    useScheduleStore();

  if (!isScheduleMode) return null;

  // 상태별 메시지
  const getStatusMessage = () => {
    switch (status) {
      case "parsing":
        return t("schedule.status.parsing");
      case "confirming":
        return t("schedule.status.confirming");
      case "generating":
        return t("schedule.status.generating");
      case "complete":
        return t("schedule.status.complete");
      case "error":
        return t("schedule.status.error");
      default:
        return t("schedule.status.idle");
    }
  };

  // 필터 태그 표시
  const filterTags = [];
  if (filters.emptyDays.length > 0) {
    const dayOrder = ["mon", "tue", "wed", "thu", "fri"];
    const dayNames: Record<string, string> = {
      mon: t("schedule.days.mon"),
      tue: t("schedule.days.tue"),
      wed: t("schedule.days.wed"),
      thu: t("schedule.days.thu"),
      fri: t("schedule.days.fri"),
    };
    // 월화수목금 순서로 정렬
    const sortedDays = [...filters.emptyDays].sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );
    filterTags.push(
      `${sortedDays.map((d) => dayNames[d]).join(", ")} ${t(
        "schedule.filter.emptyDay"
      )}`
    );
  }
  if (filters.maxCredits) {
    filterTags.push(`${filters.maxCredits}${t("schedule.filter.maxCredits")}`);
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Calendar size={18} />
        </div>
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            {t("schedule.modeActive")}
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-white/80">{getStatusMessage()}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 필터 태그 */}
        {filterTags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5">
            {filterTags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/20 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={exitScheduleMode}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label={t("schedule.exitMode")}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
