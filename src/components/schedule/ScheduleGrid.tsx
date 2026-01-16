/**
 * 시간표 그리드 컴포넌트
 * 분 단위 정밀도 지원 (실제 대학 수업 시간 표시)
 * 동적 시작/종료 시간, 겹치는 수업 나란히 배치
 */
import { useMemo, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { Course, Day, TimeSlot } from "@/types";

interface ScheduleGridProps {
  courses: Course[];
  compact?: boolean;
  onCourseClick?: (course: Course) => void;
}

const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri"];

// 시간 범위 기본값
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 19;
const MAX_END_HOUR = 24;
const MIN_START_HOUR = 6;

// 시간 문자열을 분으로 변환
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 두 시간대가 겹치는지 확인
const isOverlapping = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  if (slot1.day !== slot2.day) return false;
  const s1 = timeToMinutes(slot1.startTime);
  const e1 = timeToMinutes(slot1.endTime);
  const s2 = timeToMinutes(slot2.startTime);
  const e2 = timeToMinutes(slot2.endTime);
  return s1 < e2 && s2 < e1;
};

interface SlotWithPosition {
  course: Course;
  slot: TimeSlot;
  columnIndex: number;
  totalColumns: number;
}

// 겹치는 슬롯들을 그룹화하고 열 위치 할당
const assignSlotPositions = (
  slots: { course: Course; slot: TimeSlot }[]
): SlotWithPosition[] => {
  if (slots.length === 0) return [];

  const sorted = [...slots].sort(
    (a, b) => timeToMinutes(a.slot.startTime) - timeToMinutes(b.slot.startTime)
  );

  const result: SlotWithPosition[] = [];
  const activeSlots: { slot: TimeSlot; columnIndex: number }[] = [];

  for (const item of sorted) {
    const stillActive = activeSlots.filter((active) =>
      isOverlapping(active.slot, item.slot)
    );

    const usedColumns = new Set(stillActive.map((s) => s.columnIndex));
    let columnIndex = 0;
    while (usedColumns.has(columnIndex)) {
      columnIndex++;
    }

    stillActive.push({ slot: item.slot, columnIndex });
    activeSlots.length = 0;
    activeSlots.push(...stillActive);

    result.push({
      ...item,
      columnIndex,
      totalColumns: 1,
    });
  }

  for (let i = 0; i < result.length; i++) {
    const current = result[i];
    let maxColumns = current.columnIndex + 1;

    for (let j = 0; j < result.length; j++) {
      if (i !== j && isOverlapping(current.slot, result[j].slot)) {
        maxColumns = Math.max(maxColumns, result[j].columnIndex + 1);
      }
    }

    current.totalColumns = maxColumns;
  }

  for (let i = 0; i < result.length; i++) {
    const current = result[i];
    for (let j = 0; j < result.length; j++) {
      if (i !== j && isOverlapping(current.slot, result[j].slot)) {
        const maxCols = Math.max(current.totalColumns, result[j].totalColumns);
        current.totalColumns = maxCols;
        result[j].totalColumns = maxCols;
      }
    }
  }

  return result;
};

export const ScheduleGrid = forwardRef<HTMLDivElement, ScheduleGridProps>(
  ({ courses, compact = false, onCourseClick }, ref) => {
    const { t } = useTranslation();

    // 동적 시작/종료 시간 계산
    const { startHour, endHour } = useMemo(() => {
      let minStartHour = DEFAULT_START_HOUR;
      let maxEndHour = DEFAULT_END_HOUR;

      courses.forEach((course) => {
        course.slots.forEach((slot) => {
          const slotStartHour = Math.floor(timeToMinutes(slot.startTime) / 60);
          const slotEndHour = Math.ceil(timeToMinutes(slot.endTime) / 60);

          if (slotStartHour < minStartHour) {
            minStartHour = Math.max(slotStartHour, MIN_START_HOUR);
          }
          if (slotEndHour > maxEndHour) {
            maxEndHour = Math.min(slotEndHour, MAX_END_HOUR);
          }
        });
      });

      return { startHour: minStartHour, endHour: maxEndHour };
    }, [courses]);

    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;
    const totalMinutes = endMinutes - startMinutes;
    const hourCount = endHour - startHour;

    // 각 요일별 과목 슬롯 정리
    const slotsByDay = useMemo(() => {
      const result: Record<Day, SlotWithPosition[]> = {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
      };

      const rawSlots: Record<Day, { course: Course; slot: TimeSlot }[]> = {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
      };

      courses.forEach((course) => {
        course.slots.forEach((slot) => {
          rawSlots[slot.day].push({ course, slot });
        });
      });

      DAYS.forEach((day) => {
        result[day] = assignSlotPositions(rawSlots[day]);
      });

      return result;
    }, [courses]);

    const hourHeight = compact ? 32 : 48;
    const totalHeight = hourCount * hourHeight;
    const fontSize = compact ? "text-[10px]" : "text-xs";
    const timeColWidth = compact ? 36 : 52;

    const minutesToPosition = (mins: number): number => {
      return ((mins - startMinutes) / totalMinutes) * totalHeight;
    };

    const getSlotHeight = (slot: TimeSlot): number => {
      const startMins = timeToMinutes(slot.startTime);
      const endMins = timeToMinutes(slot.endTime);
      return ((endMins - startMins) / totalMinutes) * totalHeight;
    };

    return (
      <div
        ref={ref}
        className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${timeColWidth}px repeat(5, minmax(0, 1fr))`,
          }}
        >
          {/* 헤더 행 */}
          <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 h-8" />
          {DAYS.map((day) => (
            <div
              key={day}
              className={`py-2 text-center font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border-l border-b border-gray-200 dark:border-slate-700 ${fontSize}`}
            >
              {t(`schedule.days.${day}`)}
            </div>
          ))}

          {/* 시간 라벨 열 */}
          <div className="relative bg-gray-50 dark:bg-slate-800">
            {Array.from({ length: hourCount }, (_, i) => (
              <div
                key={`time-${i}`}
                className={`absolute w-full flex items-start justify-center pt-0.5 text-gray-500 dark:text-gray-400 ${fontSize}`}
                style={{
                  top: i * hourHeight,
                  height: hourHeight,
                }}
              >
                {`${(startHour + i).toString().padStart(2, "0")}:00`}
              </div>
            ))}
            <div style={{ height: totalHeight }} />
          </div>

          {/* 요일별 컬럼 */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="relative border-l border-gray-200 dark:border-slate-700"
              style={{ height: totalHeight }}
            >
              {/* 시간 구분선 */}
              {Array.from({ length: hourCount }, (_, i) => (
                <div
                  key={`line-${i}`}
                  className="absolute w-full border-t border-gray-200 dark:border-slate-700"
                  style={{ top: i * hourHeight }}
                />
              ))}

              {/* 과목 슬롯들 */}
              {slotsByDay[day].map(
                ({ course, slot, columnIndex, totalColumns }, slotIdx) => {
                  const top = minutesToPosition(timeToMinutes(slot.startTime));
                  const height = getSlotHeight(slot);
                  const widthPercent = 100 / totalColumns;
                  const leftPercent = columnIndex * widthPercent;

                  return (
                    <button
                      key={`${course.id}-${slotIdx}`}
                      onClick={() => onCourseClick?.(course)}
                      className={`absolute overflow-hidden text-left transition-opacity hover:opacity-90 ${fontSize}`}
                      style={{
                        top: top,
                        height: height,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: course.color || "#4e92ff",
                        color: "white",
                      }}
                    >
                      <div className="p-1 h-full flex flex-col">
                        <div className="font-medium truncate">
                          {compact ? course.name.slice(0, 4) : course.name}
                        </div>
                        {!compact && height > 28 && (
                          <div className="text-white/85 truncate text-[10px]">
                            {course.section
                              ? `${course.code}[${course.section}]`
                              : course.code}
                          </div>
                        )}
                        {!compact && height > 42 && (
                          <div className="text-white/80 truncate text-[10px]">
                            {slot.location}
                          </div>
                        )}
                        {!compact && height > 58 && (
                          <div className="text-white/70 text-[9px] mt-auto">
                            {slot.startTime}~{slot.endTime}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ScheduleGrid.displayName = "ScheduleGrid";
