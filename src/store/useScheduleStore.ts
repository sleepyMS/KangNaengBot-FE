/**
 * 시간표 상태 관리 Store
 */
import { create } from "zustand";
import type {
  Course,
  Schedule,
  AmbiguousCourse,
  ScheduleFilters,
  ScheduleError,
  SavedSchedule,
} from "@/types";
import { scheduleService } from "@/api";
import i18n from "@/i18n";

type ScheduleStatus =
  | "idle"
  | "parsing"
  | "confirming"
  | "generating"
  | "complete"
  | "error";

interface ScheduleState {
  // 모드 상태
  isScheduleMode: boolean;
  status: ScheduleStatus;

  // 과목 선택
  userInput: string;
  parsedCourses: Course[];
  ambiguousCourses: AmbiguousCourse[];
  confirmedCourses: Course[];

  // 필터 설정
  filters: ScheduleFilters;

  // 생성 결과
  allSchedules: Schedule[];
  generatedSchedules: Schedule[];
  activeScheduleIndex: number;

  // Canvas UI
  isCanvasOpen: boolean;

  // 저장 기능
  savedSchedules: SavedSchedule[];

  // 에러 상태
  error: ScheduleError | null;

  // Actions
  enterScheduleMode: () => void;
  exitScheduleMode: () => void;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  generateSchedulesFromMessage: (
    sessionId: string,
    message: string
  ) => Promise<void>;
  selectAmbiguousCourse: (ambiguousIndex: number, courseIndex: number) => void;
  confirmAllCourses: () => void;
  generateSchedules: (sessionId: string) => Promise<void>;
  setActiveSchedule: (index: number) => void;
  openCanvas: () => void;
  closeCanvas: () => void;
  saveSchedule: (name?: string) => void;
  deleteSavedSchedule: (id: string) => void;
  clearError: () => void;
  reset: () => void;
}

const DEFAULT_FILTERS: ScheduleFilters = {
  maxCredits: null,
  emptyDays: [],
  excludePeriods: [],
  preferCompact: false,
};

const filterSchedules = (
  schedules: Schedule[],
  filters: ScheduleFilters
): Schedule[] => {
  return schedules.filter((schedule) => {
    // 1. 공강 요일 체크
    // 사용자가 선택한 공강 요일이 스케줄의 emptyDays에 모두 포함되어야 함
    const emptyDayPass = filters.emptyDays.every((day) =>
      schedule.emptyDays.includes(day)
    );
    if (!emptyDayPass) return false;

    // 2. 제외 시간대 체크
    if (filters.excludePeriods.length > 0) {
      for (const course of schedule.courses) {
        for (const slot of course.slots) {
          for (const ex of filters.excludePeriods) {
            if (slot.day === ex.day) {
              // 겹치는 시간이 있는지 확인
              const hasOverlap = ex.periods.some(
                (p) => p >= slot.startPeriod && p <= slot.endPeriod
              );
              if (hasOverlap) return false;
            }
          }
        }
      }
    }
    return true;
  });
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  // Initial State
  isScheduleMode: false,
  status: "idle",
  userInput: "",
  parsedCourses: [],
  ambiguousCourses: [],
  confirmedCourses: [],
  filters: DEFAULT_FILTERS,
  allSchedules: [], // 전체 스케줄 보관용
  generatedSchedules: [],
  activeScheduleIndex: 0,
  isCanvasOpen: false,
  savedSchedules: [],
  error: null,

  // Actions
  enterScheduleMode: () => {
    set({
      isScheduleMode: true,
      status: "idle",
      parsedCourses: [],
      ambiguousCourses: [],
      confirmedCourses: [],
      generatedSchedules: [],
      error: null,
    });
  },

  exitScheduleMode: () => {
    set({
      isScheduleMode: false,
      status: "idle",
      isCanvasOpen: false,
    });
  },

  setFilters: (newFilters) => {
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      // 필터 변경 시 즉시 필터링 적용
      const filtered = filterSchedules(state.allSchedules, updatedFilters);

      return {
        filters: updatedFilters,
        generatedSchedules: filtered,
        activeScheduleIndex: 0,
      };
    });
  },

  generateSchedulesFromMessage: async (sessionId, message) => {
    // 1. 생성 상태로 전환
    set({ status: "generating", userInput: message, error: null });

    try {
      // 2. 단일 API 호출로 시간표 생성
      const response = await scheduleService.generateSchedulesFromText(
        sessionId,
        message
      );

      if (!response.success || response.schedules.length === 0) {
        set({
          status: "error",
          error: {
            type: response.fallback?.reason || "generation_failed",
            message:
              response.fallback?.suggestions?.join(", ") ||
              i18n.t("schedule.error.generationFailed"),
            retryable: true,
          },
        });
        return;
      }

      // 3. 필터 추출 및 적용 (Mock에서는 추출 로직이 포함되어 있다고 가정하거나 생략)
      // 실제 구현에서는 generateSchedulesFromText 응답에 extractedFilters가 포함되어야 함
      // 현재는 간단히 스킵하거나 필요 시 추가

      set({
        status: "complete",
        allSchedules: response.schedules, // 원본 저장
        generatedSchedules: response.schedules, // 초기에는 필터링 없이 전체 표시 (또는 기본 필터 적용)
        activeScheduleIndex: 0,
        // 파싱된 코스는 응답에 없으므로 (Mock 구조상) 빈 배열 혹은 추후 응답 구조 변경 필요
        parsedCourses: [],
        confirmedCourses: [],
        ambiguousCourses: [],
      });
    } catch {
      set({
        status: "error",
        error: {
          type: "generation_failed",
          message: i18n.t("schedule.error.generationFailed"),
          retryable: true,
        },
      });
    }
  },

  selectAmbiguousCourse: (ambiguousIndex, courseIndex) => {
    set((state) => {
      const newAmbiguous = [...state.ambiguousCourses];
      if (newAmbiguous[ambiguousIndex]) {
        newAmbiguous[ambiguousIndex] = {
          ...newAmbiguous[ambiguousIndex],
          selectedIndex: courseIndex,
        };
      }
      return { ambiguousCourses: newAmbiguous };
    });
  },

  confirmAllCourses: () => {
    const { parsedCourses, ambiguousCourses } = get();

    // 이미 확정된 과목 + 애매한 과목 중 선택된 것들
    const confirmed: Course[] = [...parsedCourses];

    ambiguousCourses.forEach((amb) => {
      if (amb.selectedIndex !== null && amb.candidates[amb.selectedIndex]) {
        confirmed.push(amb.candidates[amb.selectedIndex]);
      }
    });

    set({ confirmedCourses: confirmed });
  },

  generateSchedules: async (sessionId) => {
    const { confirmedCourses, filters } = get();

    if (confirmedCourses.length === 0) {
      set({
        status: "error",
        error: {
          type: "no_courses",
          message: i18n.t("schedule.error.noCoursesSelected"),
          retryable: true,
        },
      });
      return;
    }

    set({ status: "generating", error: null });

    try {
      const courseIds = confirmedCourses.map((c) => c.id);
      const response = await scheduleService.generateSchedules(
        sessionId,
        courseIds,
        filters
      );

      if (!response.success || response.schedules.length === 0) {
        set({
          status: "error",
          error: {
            type: response.fallback?.reason || "generation_failed",
            message:
              response.fallback?.suggestions?.join(", ") ||
              i18n.t("schedule.error.generationFailed"),
            retryable: true,
          },
        });
        return;
      }

      set({
        status: "complete",
        generatedSchedules: response.schedules,
        activeScheduleIndex: 0,
      });
    } catch {
      set({
        status: "error",
        error: {
          type: "generation_failed",
          message: i18n.t("schedule.error.generationFailed"),
          retryable: true,
        },
      });
    }
  },

  setActiveSchedule: (index) => {
    const { generatedSchedules } = get();
    if (index >= 0 && index < generatedSchedules.length) {
      set({ activeScheduleIndex: index });
    }
  },

  openCanvas: () => set({ isCanvasOpen: true }),
  closeCanvas: () => set({ isCanvasOpen: false }),

  saveSchedule: (name) => {
    const { generatedSchedules, activeScheduleIndex, savedSchedules } = get();
    const schedule = generatedSchedules[activeScheduleIndex];

    if (!schedule) return;

    const savedSchedule: SavedSchedule = {
      ...schedule,
      id: `saved-${Date.now()}`,
      savedAt: new Date().toISOString(),
      name: name || `시간표 ${savedSchedules.length + 1}`,
      isFavorite: false,
    };

    set((state) => ({
      savedSchedules: [savedSchedule, ...state.savedSchedules],
    }));

    // localStorage에도 저장
    try {
      const stored = localStorage.getItem("kangnaeng-saved-schedules");
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(
        "kangnaeng-saved-schedules",
        JSON.stringify([savedSchedule, ...existing])
      );
    } catch {
      // localStorage 실패 시 무시
    }
  },

  deleteSavedSchedule: (id) => {
    set((state) => ({
      savedSchedules: state.savedSchedules.filter((s) => s.id !== id),
    }));

    // localStorage에서도 삭제
    try {
      const stored = localStorage.getItem("kangnaeng-saved-schedules");
      if (stored) {
        const existing = JSON.parse(stored);
        localStorage.setItem(
          "kangnaeng-saved-schedules",
          JSON.stringify(existing.filter((s: SavedSchedule) => s.id !== id))
        );
      }
    } catch {
      // localStorage 실패 시 무시
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      isScheduleMode: false,
      status: "idle",
      userInput: "",
      parsedCourses: [],
      ambiguousCourses: [],
      confirmedCourses: [],
      filters: DEFAULT_FILTERS,
      generatedSchedules: [],
      activeScheduleIndex: 0,
      isCanvasOpen: false,
      error: null,
    });
  },
}));
