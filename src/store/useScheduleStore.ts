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
import { useToastStore } from "./useToastStore";

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
  relatedSessionId: string | null; // 시간표 생성을 요청한 세션 ID

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
  activeSavedIndex: number; // 저장된 시간표 캐러셀 인덱스
  loadedSchedule: SavedSchedule | null; // 불러온 시간표 별도 저장 (deprecated, kept for compatibility)

  // 에러 상태
  error: ScheduleError | null;

  // Actions
  enterScheduleMode: () => void;
  exitScheduleMode: () => void;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  generateSchedulesFromMessage: (
    sessionId: string,
    message: string,
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
  setActiveSavedIndex: (index: number) => void; // 저장된 시간표 캐러셀 인덱스 변경
  deleteSavedSchedule: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  switchToGeneratedView: () => void; // 생성된 결과 보기로 전환
  restoreSchedules: (schedules: Schedule[]) => void; // 메타데이터로부터 시간표 복원
  setGeneratedSchedules: (schedules: Schedule[]) => void; // Chat store에서 호출 - UI 상태 업데이트
}

const DEFAULT_FILTERS: ScheduleFilters = {
  maxCredits: null,
  emptyDays: [],
  excludeTimeRanges: [],
  preferCompact: false,
};

// 시간 문자열을 분 단위로 변환 (비교용)
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 시간 범위가 겹치는지 확인
const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
};

const filterSchedules = (
  schedules: Schedule[],
  filters: ScheduleFilters,
): Schedule[] => {
  return schedules.filter((schedule) => {
    // 1. 공강 요일 체크
    const emptyDayPass = filters.emptyDays.every((day) =>
      schedule.emptyDays.includes(day),
    );
    if (!emptyDayPass) return false;

    // 2. 제외 시간대 체크
    if (filters.excludeTimeRanges.length > 0) {
      for (const course of schedule.courses) {
        for (const slot of course.slots) {
          for (const ex of filters.excludeTimeRanges) {
            if (
              slot.day === ex.day &&
              timeRangesOverlap(
                slot.startTime,
                slot.endTime,
                ex.startTime,
                ex.endTime,
              )
            ) {
              return false;
            }
          }
        }
      }
    }
    return true;
  });
};

// 네이티브 위젯 싱크 헬퍼
const syncToNativeWidget = (schedule: Schedule | SavedSchedule | null) => {
  if (typeof window !== "undefined" && window.sendToNative && schedule) {
    console.log("[useScheduleStore] Syncing schedule to widget:", schedule.id);
    window.sendToNative("SCHEDULE_SAVED", schedule);
  }
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  // Initial State
  isScheduleMode: false,
  viewMode: "generated",
  status: "idle",
  relatedSessionId: null,
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
  activeSavedIndex: 0,
  loadedSchedule: null,
  error: null,

  // Actions
  enterScheduleMode: () => {
    set({
      isScheduleMode: true,
      status: "idle",
      relatedSessionId: null,
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
      relatedSessionId: sessionId,
      userInput: message,
      error: null,
      viewMode: "generated",
      loadedSchedule: null,
    });

    try {
      // 2. 단일 API 호출로 시간표 생성
      const response = await scheduleService.generateSchedulesFromText(
        sessionId,
        message,
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
        i18n.t("schedule.status.found", { count: response.schedules.length });

      useChatStore.getState().addMessage({
        role: "assistant",
        content: resultMessage,
        created_at: new Date().toISOString(),
        type: "schedule_result",
        metadata: {
          scheduleCount: response.schedules.length,
          schedules: response.schedules, // 복원을 위해 전체 데이터 저장
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

    set({ status: "generating", relatedSessionId: sessionId, error: null });

    try {
      const courseIds = confirmedCourses.map((c) => c.id);
      const response = await scheduleService.generateSchedules(
        sessionId,
        courseIds,
        filters,
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
    try {
      // 초기 로딩
      const saved = await scheduleService.getSavedSchedules();
      set({ savedSchedules: Array.isArray(saved) ? saved : [] });

      // 저장된 시간표가 있으면 첫 번째 시간표를 위젯에 동기화
      if (Array.isArray(saved) && saved.length > 0) {
        syncToNativeWidget(saved[0]);
      }
    } catch (error) {
      console.error(
        "[useScheduleStore] Failed to load saved schedules:",
        error,
      );
      set({ savedSchedules: [] });
    }
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
        s.id === schedule.id ? { ...s, savedId: newSavedSchedule.id } : s,
      );

      return {
        savedSchedules: [newSavedSchedule, ...state.savedSchedules],
        generatedSchedules: updatedGeneratedSchedules,
      };
    });

    // 2. 비동기 저장 (API or LocalStorage)
    // 게스트 모드 확인
    const authStorage = localStorage.getItem("auth-storage");
    const isAuthenticated = authStorage
      ? JSON.parse(authStorage)?.state?.isAuthenticated
      : false;

    try {
      await scheduleService.saveSchedule(newSavedSchedule);
      // 게스트 모드일 경우 로그인 유도 메시지 표시
      if (!isAuthenticated) {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.save.guestMode"));
      }
      // 저장 성공 시 위젯 동기화
      syncToNativeWidget(newSavedSchedule);
    } catch (error) {
      // API 에러 시 게스트 모드에 따라 다른 메시지 표시 (낙관적 UI는 유지)
      console.warn(
        "[saveSchedule] API not ready, keeping optimistic UI:",
        error,
      );
      if (!isAuthenticated) {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.save.guestMode"));
      } else {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.save.comingSoon"));
      }
    }
  },

  deleteSavedSchedule: async (id) => {
    // 1. 낙관적 UI 업데이트
    set((state) => {
      const updatedGeneratedSchedules = state.generatedSchedules.map((s) =>
        s.savedId === id ? { ...s, savedId: undefined } : s,
      );

      return {
        savedSchedules: state.savedSchedules.filter((s) => s.id !== id),
        generatedSchedules: updatedGeneratedSchedules,
      };
    });

    // 2. 비동기 삭제 (API or LocalStorage)
    // 게스트 모드 확인
    const authStorage = localStorage.getItem("auth-storage");
    const isAuthenticated = authStorage
      ? JSON.parse(authStorage)?.state?.isAuthenticated
      : false;

    try {
      await scheduleService.deleteSavedSchedule(id);
      // 게스트 모드일 경우 안내 메시지
      if (!isAuthenticated) {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.delete.guestMode"));
      }
    } catch (error) {
      // API 에러 시 게스트 모드에 따라 다른 메시지 표시 (낙관적 UI는 유지)
      console.warn(
        "[deleteSavedSchedule] API not ready, keeping optimistic UI:",
        error,
      );
      if (!isAuthenticated) {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.delete.guestMode"));
      } else {
        useToastStore
          .getState()
          .addToast("info", i18n.t("schedule.delete.comingSoon"));
      }
    }
  },

  loadSchedule: (schedule) => {
    const { savedSchedules } = get();
    // 선택된 시간표의 인덱스 찾기
    const index = savedSchedules.findIndex((s) => s.id === schedule.id);
    set({
      // generatedSchedules, status, aiMessage 등은 건드리지 않음 (Backpreservation)
      loadedSchedule: schedule, // 호환성을 위해 유지
      activeSavedIndex: index >= 0 ? index : 0,
      isCanvasOpen: true,
      viewMode: "saved",
    });
    // 선택된 시간표 위젯 동기화
    syncToNativeWidget(schedule);
  },

  setActiveSavedIndex: (index) => {
    const { savedSchedules } = get();
    if (index >= 0 && index < savedSchedules.length) {
      set({
        activeSavedIndex: index,
        loadedSchedule: savedSchedules[index] || null, // 호환성을 위해 동기화
      });
      // 인덱스 변경 시 위젯 동기화
      if (savedSchedules[index]) {
        syncToNativeWidget(savedSchedules[index]);
      }
    }
  },

  switchToGeneratedView: () => {
    set({
      viewMode: "generated",
      isCanvasOpen: true,
    });
  },

  restoreSchedules: (schedules) => {
    set({
      status: "complete",
      allSchedules: schedules,
      generatedSchedules: schedules,
      viewMode: "generated",
      isCanvasOpen: true,
      activeScheduleIndex: 0,
      filters: DEFAULT_FILTERS,
    });
  },

  // Chat store에서 호출되는 시간표 설정 액션
  setGeneratedSchedules: (schedules) => {
    set({
      status: "complete",
      allSchedules: schedules,
      generatedSchedules: schedules,
      activeScheduleIndex: 0,
      viewMode: "generated",
      isCanvasOpen: true,
      loadedSchedule: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      isScheduleMode: false,
      status: "idle",
      relatedSessionId: null,
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
