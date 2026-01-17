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

/**
 * 저장된 시간표 목록 조회
 */
export const getSavedSchedules = async (
  _sessionId?: string,
): Promise<import("@/types").SavedSchedule[]> => {
  try {
    // 실제 API 호출 시도
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
        isFavorite: false, // API 미지원
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
): Promise<boolean> => {
  try {
    // 실제 API 호출 시도
    // SavedSchedule 메타데이터 제외하고 순수 Schedule 데이터만 추출하여 전송 가능
    // 여기서는 전체를 보내되 필요한 필드 덮어쓰기
    const payload = {
      title: schedule.name,
      schedule_data: schedule, // 전체 객체 저장 (필요시 필터링)
    };

    await apiClient.post(`/schedules/`, payload);
    return true;
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
      return true;
    } catch {
      return false;
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
