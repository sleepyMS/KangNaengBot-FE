import apiClient from "../apiClient";
import type {
  CreateSessionResponse,
  ListSessionsResponse,
  GetMessagesResponse,
  DeleteSessionResponse,
} from "@/types";

/**
 * 새로운 채팅 세션 생성
 */
export const createSession = async (): Promise<CreateSessionResponse> => {
  const response = await apiClient.post<CreateSessionResponse>("/sessions/");
  return response.data;
};

/**
 * 세션 목록 조회
 * @param includeInactive 비활성 세션 포함 여부
 */
export const listSessions = async (
  includeInactive = false,
): Promise<ListSessionsResponse> => {
  const response = await apiClient.get<ListSessionsResponse>("/sessions/", {
    params: { include_inactive: includeInactive },
  });
  return response.data;
};

/**
 * 특정 세션의 메시지 내역 조회
 * @param sessionId 세션 UUID
 * @param limit 조회할 메시지 수 제한
 */
export const getSessionMessages = async (
  sessionId: string,
  limit?: number,
): Promise<GetMessagesResponse> => {
  const response = await apiClient.get<GetMessagesResponse>(
    `/sessions/${sessionId}/messages`,
    { params: limit ? { limit } : undefined },
  );
  return response.data;
};

/**
 * 세션 삭제 (소프트 삭제)
 * @param sessionId 세션 UUID
 */
export const deleteSession = async (
  sessionId: string,
): Promise<DeleteSessionResponse> => {
  const response = await apiClient.delete<DeleteSessionResponse>(
    `/sessions/${sessionId}`,
  );
  return response.data;
};

/**
 * 게스트 세션을 유저로 병합
 * @param sessionId 병합할 세션 ID
 */
export const mergeSession = async (
  sessionId: string,
): Promise<{ message: string; session_id: string }> => {
  const response = await apiClient.post<{
    message: string;
    session_id: string;
  }>(`/sessions/sessions/${sessionId}/merge`);
  return response.data;
};
