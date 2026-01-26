/**
 * 시간표 API 서비스
 * Mock 데이터 사용 → 나중에 실제 API로 교체
 */

import type {
  ParseCoursesResponse,
  GenerateSchedulesResponse,
  ScheduleFilters,
  SavedSchedule,
  BackendSavedSchedule,
  Schedule,
} from "@/types";
import {
  mockParseCoursesFromMessage,
  mockGenerateSchedules,
  mockGenerateSchedulesFromText,
} from "../mocks/scheduleMock";
import { apiClient } from "../apiClient";

export const parseCourses = async (
  sessionId: string,
  message: string,
): Promise<ParseCoursesResponse> => {
  try {
    // 실제 API 호출 시도
    const response = await apiClient.post<ParseCoursesResponse>(
      `/schedules/parse`,
      {
        session_id: sessionId,
        message,
      },
    );
    return response.data;
  } catch (error) {
    // 실패 시 Mock 데이터 사용 (개발 중 백엔드 미구현 상황 대응)
    console.warn(
      "[ScheduleService] Falling back to mock data for parseCourses:",
      error,
    );
    return mockParseCoursesFromMessage(message);
  }
};

/**
 * 시간표 생성
 */
export const generateSchedules = async (
  sessionId: string,
  courseIds: string[],
  filters?: ScheduleFilters,
): Promise<GenerateSchedulesResponse> => {
  try {
    // 실제 API 호출 시도
    const response = await apiClient.post<GenerateSchedulesResponse>(
      `/schedules/generate`,
      {
        session_id: sessionId,
        course_ids: courseIds,
        filters,
      },
    );
    return response.data;
  } catch (error) {
    // 실패 시 Mock 데이터 사용
    console.warn(
      "[ScheduleService] Falling back to mock data for generateSchedules:",
      error,
    );
    return mockGenerateSchedules(courseIds);
  }
};

/**
 * 텍스트에서 바로 시간표 생성 (Single Step)
 */
export const generateSchedulesFromText = async (
  sessionId: string,
  message: string,
): Promise<GenerateSchedulesResponse> => {
  try {
    // 실제 API 호출 시도
    const response = await apiClient.post<GenerateSchedulesResponse>(
      `/schedules/generate/text`,
      {
        session_id: sessionId,
        message,
      },
    );
    return response.data;
  } catch (error) {
    // 실패 시 Mock 데이터 사용
    console.warn(
      "[ScheduleService] Falling back to mock data for generateSchedulesFromText:",
      error,
    );
    return mockGenerateSchedulesFromText(message);
  }
};
// LocalStorage 키
const SAVED_SCHEDULES_KEY = "kangnaeng-saved-schedules";
const REPRESENTATIVE_SCHEDULE_KEY = "kangnaeng-representative-schedule";

/**
 * 저장된 시간표 목록 조회
 */
export const getSavedSchedules = async (
  _sessionId?: string,
): Promise<import("@/types").SavedSchedule[]> => {
  try {
    // 실제 API 호출 시도
    const response = await apiClient.get<BackendSavedSchedule[]>(`/schedules/`);

    return response.data.map((item) => {
      // schedule_data가 래핑되어 있을 경우 처리 (예방적 차원)
      const scheduleData =
        item.schedule_data && "schedules" in item.schedule_data
          ? (item.schedule_data as any).schedules[0]
          : item.schedule_data;

      return {
        ...(scheduleData as Schedule),
        id: item.id, // 저장된 ID 사용
        savedAt: item.created_at,
        name: item.title,
        isFavorite: false,
        isRepresentative: item.is_representative, // 대표 시간표 여부
        savedId: item.id,
      };
    });
  } catch (error) {
    // 실패 시 LocalStorage 사용
    console.warn(
      "[ScheduleService] Falling back to LocalStorage for getSavedSchedules:",
      error,
    );
    try {
      const stored = localStorage.getItem(SAVED_SCHEDULES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};

/**
 * 시간표 저장
 */
export const saveSchedule = async (
  schedule: SavedSchedule,
): Promise<{ success: boolean; serverId?: string }> => {
  try {
    // 실제 API 호출 시도
    // SavedSchedule 메타데이터 제외하고 순수 Schedule 데이터만 추출하여 전송 가능
    // 여기서는 전체를 보내되 필요한 필드 덮어쓰기
    const payload = {
      title: schedule.name,
      schedule_data: schedule, // 전체 객체 저장 (필요시 필터링)
    };

    const response = await apiClient.post(`/schedules/`, payload);
    // 서버에서 반환된 ID 추출
    const serverId = response.data?.id || response.data?.schedule_id;
    return { success: true, serverId };
  } catch (error) {
    // 실패 시 LocalStorage 사용
    console.warn(
      "[ScheduleService] Falling back to LocalStorage for saveSchedule:",
      error,
    );
    try {
      const stored = localStorage.getItem(SAVED_SCHEDULES_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      // 중복 체크 (선택 사항)
      const isDuplicate = existing.some(
        (s: import("@/types").SavedSchedule) => s.id === schedule.id,
      );
      if (!isDuplicate) {
        localStorage.setItem(
          SAVED_SCHEDULES_KEY,
          JSON.stringify([schedule, ...existing]),
        );
      }
      return { success: true }; // localStorage에서는 클라이언트 ID 그대로 사용
    } catch {
      return { success: false };
    }
  }
};

/**
 * 저장된 시간표 삭제
 */
export const deleteSavedSchedule = async (
  scheduleId: string,
): Promise<boolean> => {
  try {
    // 실제 API 호출 시도
    // 실제 API 호출 시도
    await apiClient.delete(`/schedules/${scheduleId}`);
    return true;
  } catch (error) {
    // 실패 시 LocalStorage 사용
    console.warn(
      "[ScheduleService] Falling back to LocalStorage for deleteSavedSchedule:",
      error,
    );
    try {
      const stored = localStorage.getItem(SAVED_SCHEDULES_KEY);
      if (stored) {
        const existing = JSON.parse(stored);
        const filtered = existing.filter(
          (s: import("@/types").SavedSchedule) => s.id !== scheduleId,
        );
        localStorage.setItem(SAVED_SCHEDULES_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * 대표 시간표 단건 조회
 */
export const getRepresentativeSchedule = async (): Promise<
  import("@/types").SavedSchedule | null
> => {
  try {
    const response = await apiClient.get<BackendSavedSchedule>(
      "/schedules/representative",
    );
    const item = response.data;
    const scheduleData =
      item.schedule_data && "schedules" in item.schedule_data
        ? (item.schedule_data as any).schedules[0]
        : item.schedule_data;

    return {
      ...(scheduleData as Schedule),
      id: item.id,
      savedAt: item.created_at,
      name: item.title,
      isFavorite: false,
      savedId: item.id,
      isRepresentative: true,
    };
  } catch (error) {
    // 404: 대표 시간표 없음
    if ((error as any)?.response?.status === 404) {
      return null;
    }
    // 게스트 모드 폴백
    console.warn(
      "[ScheduleService] Falling back to LocalStorage for getRepresentativeSchedule:",
      error,
    );
    try {
      const stored = localStorage.getItem(REPRESENTATIVE_SCHEDULE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
};

/**
 * 대표 시간표 설정
 */
export const setRepresentativeSchedule = async (
  scheduleId: string,
  schedule?: import("@/types").SavedSchedule,
): Promise<boolean> => {
  // 인증 상태 확인
  const authStorage = localStorage.getItem("auth-storage");
  const isAuthenticated = authStorage
    ? JSON.parse(authStorage)?.state?.isAuthenticated
    : false;

  if (isAuthenticated) {
    try {
      await apiClient.patch(`/schedules/${scheduleId}/representative`);
      return true;
    } catch (error) {
      console.error("[ScheduleService] Failed to set representative:", error);
      return false;
    }
  } else {
    // 게스트 모드: LocalStorage 저장
    if (schedule) {
      localStorage.setItem(
        REPRESENTATIVE_SCHEDULE_KEY,
        JSON.stringify({
          ...schedule,
          isRepresentative: true,
        }),
      );
    }
    return true;
  }
};
