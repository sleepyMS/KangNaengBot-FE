/**
 * 시간표 필터 패널
 * 공강 요일 및 특정 시간대 제외 설정
 */
import { useTranslation } from "react-i18next";
import { Filter, Info } from "lucide-react";
import { useScheduleStore } from "@/store";
import type { Day } from "@/types";

const DAYS: { id: Day; label: string }[] = [
  { id: "mon", label: "월" },
  { id: "tue", label: "화" },
  { id: "wed", label: "수" },
  { id: "thu", label: "목" },
  { id: "fri", label: "금" },
];

// 시간 슬롯 (09:00 ~ 20:00, 12개)
const TIME_HOURS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 9;
  return {
    startTime: `${hour.toString().padStart(2, "0")}:00`,
    endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
    label: `${hour}시`,
  };
});

const ALL_DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri"];

export const FilterPanel = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useScheduleStore();

  // 요일 토글
  const toggleEmptyDay = (day: Day) => {
    const current = filters.emptyDays;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setFilters({ emptyDays: next });
  };

  // 특정 시간대가 모든 요일에서 제외되었는지 확인
  const isTimeGloballyExcluded = (startTime: string, endTime: string) => {
    return ALL_DAYS.every((day) =>
      filters.excludeTimeRanges.some(
        (ex) =>
          ex.day === day && ex.startTime === startTime && ex.endTime === endTime
      )
    );
  };

  // 시간대 제외 토글 (전체 요일 적용)
  const toggleTimeExclusion = (startTime: string, endTime: string) => {
    const isExcluded = isTimeGloballyExcluded(startTime, endTime);
    let nextFilters = [...filters.excludeTimeRanges];

    if (isExcluded) {
      // 제외 해제: 모든 요일의 해당 시간대 제거
      nextFilters = nextFilters.filter(
        (ex) => !(ex.startTime === startTime && ex.endTime === endTime)
      );
    } else {
      // 제외 추가: 모든 요일에 해당 시간대 추가
      ALL_DAYS.forEach((day) => {
        const exists = nextFilters.some(
          (ex) =>
            ex.day === day &&
            ex.startTime === startTime &&
            ex.endTime === endTime
        );
        if (!exists) {
          nextFilters.push({ day, startTime, endTime });
        }
      });
    }

    setFilters({ excludeTimeRanges: nextFilters });
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-900 dark:text-white">
        <Filter size={16} />
        {t("schedule.filter.title")}
      </div>

      <div className="space-y-4">
        {/* 공강 요일 선택 */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t("schedule.filter.emptyDay")}
          </div>
          <div className="flex items-center gap-2">
            {DAYS.map((day) => {
              const isActive = filters.emptyDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => toggleEmptyDay(day.id)}
                  className={`
                    w-8 h-8 rounded-full text-sm font-medium transition-colors border
                    ${
                      isActive
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 시간대 설정 */}
        <div>
          <div className="flex flex-col gap-1 mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("schedule.filter.time")}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">
              {t("schedule.filter.timeDesc")}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {TIME_HOURS.map((slot) => {
              const isExcluded = isTimeGloballyExcluded(
                slot.startTime,
                slot.endTime
              );
              return (
                <button
                  key={slot.startTime}
                  onClick={() =>
                    toggleTimeExclusion(slot.startTime, slot.endTime)
                  }
                  className={`
                    py-1.5 px-1 rounded-lg text-xs font-medium transition-all flex items-center justify-center
                    ${
                      isExcluded
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300"
                    }
                  `}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-slate-800 rounded text-xs text-gray-500 dark:text-gray-400">
          <Info size={14} className="flex-shrink-0" />
          {t("schedule.filter.autoApplyInfo")}
        </div>
      </div>
    </div>
  );
};
