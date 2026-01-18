/**
 * 시간표 캐러셀 컴포넌트
 * 생성된 여러 시간표 조합을 스와이프로 탐색
 */
import { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Course, Day, Schedule } from "@/types";
import { ScheduleGrid } from "./ScheduleGrid";

// 요일 정렬 순서 (월화수목금)
const DAY_ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri"];

const sortDays = (days: Day[]): Day[] =>
  [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

interface ScheduleCarouselProps {
  schedules: Schedule[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  onCourseClick?: (course: Course) => void;
  gridRef?: RefObject<HTMLDivElement | null>;
}

export const ScheduleCarousel = ({
  schedules,
  activeIndex,
  onIndexChange,
  onScheduleClick,
  onCourseClick,
  gridRef,
}: ScheduleCarouselProps) => {
  const { t } = useTranslation();

  if (schedules.length === 0) return null;

  const currentSchedule = schedules[activeIndex];

  const goPrev = () => {
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : schedules.length - 1);
  };

  const goNext = () => {
    onIndexChange(activeIndex < schedules.length - 1 ? activeIndex + 1 : 0);
  };

  return (
    <div className="w-full">
      {/* 캐러셀 컨트롤 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          aria-label={t("schedule.canvas.prev")}
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* 인디케이터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {activeIndex + 1} / {schedules.length}
          </span>
          <div className="flex gap-1">
            {schedules.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === activeIndex
                    ? "bg-primary-500"
                    : "bg-gray-300 dark:bg-slate-600"
                }`}
                aria-label={`Schedule ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goNext}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          aria-label={t("schedule.canvas.next")}
        >
          <ChevronRight
            size={20}
            className="text-gray-600 dark:text-gray-300"
          />
        </button>
      </div>

      {/* 시간표 그리드 */}
      <div
        className="cursor-pointer"
        onClick={() => onScheduleClick?.(currentSchedule)}
      >
        <ScheduleGrid
          ref={gridRef}
          courses={currentSchedule.courses}
          onCourseClick={onCourseClick}
        />
      </div>

      {/* 시간표 정보 */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
            {currentSchedule?.totalCredits} {t("schedule.canvas.credits")}
          </span>
          {currentSchedule?.emptyDays?.length > 0 && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              {sortDays(currentSchedule.emptyDays || [])
                .map((d) => t(`schedule.days.${d}`))
                .join(", ")}{" "}
              {t("schedule.canvas.emptyDay")}
            </span>
          )}
        </div>
        <span className="text-gray-500 dark:text-gray-400">
          효율성 {currentSchedule.compactScore}%
        </span>
      </div>

      {/* 경고 메시지 */}
      {currentSchedule?.warnings?.length > 0 && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          {currentSchedule.warnings.map((warning, idx) => (
            <div
              key={idx}
              className="text-xs text-amber-700 dark:text-amber-300"
            >
              ⚠️{" "}
              {typeof warning === "string"
                ? warning
                : (warning as any)?.message}
            </div>
          ))}
        </div>
      )}

      {/* 추천 메시지 */}
      {currentSchedule?.recommendations?.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 {currentSchedule.recommendations[0]}
        </div>
      )}
    </div>
  );
};
