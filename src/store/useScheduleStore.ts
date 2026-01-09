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
import { useChatStore } from "./useChatStore";

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
  viewMode: "generated" | "saved";
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
  aiMessage: string | null;

  // Canvas UI
  isCanvasOpen: boolean;
  isSavedListOpen: boolean;

  // 저장 기능
  savedSchedules: SavedSchedule[];
  loadedSchedule: SavedSchedule | null; // 불러온 시간표 별도 저장

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
  toggleSavedList: () => void;
  loadSavedSchedules: () => Promise<void>;
  saveSchedule: (name?: string) => Promise<void>;
  loadSchedule: (schedule: SavedSchedule) => void;
  deleteSavedSchedule: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  switchToGeneratedView: () => void; // 생성된 결과 보기로 전환
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
  viewMode: "generated",
  status: "idle",
  userInput: "",
  parsedCourses: [],
  ambiguousCourses: [],
  confirmedCourses: [],
  filters: DEFAULT_FILTERS,
  allSchedules: [], // 전체 스케줄 보관용
  generatedSchedules: [],
  activeScheduleIndex: 0,
  aiMessage: null,
  isCanvasOpen: false,
  isSavedListOpen: false,
  savedSchedules: [],
  loadedSchedule: null,
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
      loadedSchedule: null,
      aiMessage: null,
      error: null,
    });
  },

  exitScheduleMode: () => {
    set({
      isScheduleMode: false,
      status: "idle",
      isCanvasOpen: false,
      isSavedListOpen: false,
      loadedSchedule: null,
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
    set({
      status: "generating",
      userInput: message,
      error: null,
      viewMode: "generated",
      loadedSchedule: null,
    });

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
        aiMessage: null, // 더 이상 사용하지 않음
        // 파싱된 코스는 응답에 없으므로 (Mock 구조상) 빈 배열 혹은 추후 응답 구조 변경 필요
        parsedCourses: [],
        confirmedCourses: [],
        ambiguousCourses: [],
      });

      // 채팅 스토어에 결과 메시지 추가 (영구 저장)
      const resultMessage =
        response.message ||
        `${response.schedules.length}개의 시간표 조합을 찾았습니다!`;

      useChatStore.getState().addMessage({
        role: "assistant",
        content: resultMessage,
        created_at: new Date().toISOString(),
        type: "schedule_result",
        metadata: {
          scheduleCount: response.schedules.length,
        },
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
  closeCanvas: () => set({ isCanvasOpen: false, isSavedListOpen: false }),
  toggleSavedList: () =>
    set((state) => ({ isSavedListOpen: !state.isSavedListOpen })),

  loadSavedSchedules: async () => {
    // 초기 로딩
    const saved = await scheduleService.getSavedSchedules();
    set({ savedSchedules: saved });
  },

  saveSchedule: async (name) => {
    const { generatedSchedules, activeScheduleIndex } = get();
    const schedule = generatedSchedules[activeScheduleIndex];

    if (!schedule) return;

    const newSavedSchedule: SavedSchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      name: name || "",
      isFavorite: false,
    };

    // 1. 낙관적 UI 업데이트
    set((state) => {
      const updatedGeneratedSchedules = state.generatedSchedules.map((s) =>
        s.id === schedule.id ? { ...s, savedId: newSavedSchedule.id } : s
      );

      return {
        savedSchedules: [newSavedSchedule, ...state.savedSchedules],
        generatedSchedules: updatedGeneratedSchedules,
      };
    });

    // 2. 비동기 저장 (API or LocalStorage)
    await scheduleService.saveSchedule(newSavedSchedule);
  },

  deleteSavedSchedule: async (id) => {
    // 1. 낙관적 UI 업데이트
    set((state) => {
      const updatedGeneratedSchedules = state.generatedSchedules.map((s) =>
        s.savedId === id ? { ...s, savedId: undefined } : s
      );

      return {
        savedSchedules: state.savedSchedules.filter((s) => s.id !== id),
        generatedSchedules: updatedGeneratedSchedules,
      };
    });

    // 2. 비동기 삭제 (API or LocalStorage)
    await scheduleService.deleteSavedSchedule(id);
  },

  loadSchedule: (schedule) => {
    set({
      // generatedSchedules, status, aiMessage 등은 건드리지 않음 (Backpreservation)
      loadedSchedule: schedule,
      isCanvasOpen: true,
      viewMode: "saved",
    });
  },

  switchToGeneratedView: () => {
    set({
      viewMode: "generated",
      isCanvasOpen: true,
    });
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
      aiMessage: null,
      isCanvasOpen: false,
      isSavedListOpen: false,
      viewMode: "generated", // Reset view mode
      error: null,
    });
  },
}));
