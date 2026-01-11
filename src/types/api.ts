/**
 * API Types - 백엔드 OpenAPI 스키마 기반 타입 정의
 * @see https://agent-backend-api-88199591627.us-east4.run.app/docs
 */

// ============================================
// Auth 관련 타입
// ============================================

/** 사용자 정보 (GET /auth/me 응답) */
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/** 토큰 생성 응답 */
export interface GenerateTokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  note: string;
}

/** 인증 토큰 정보 */
export interface AuthTokens {
  accessToken: string;
  tokenType: string;
}

// ============================================
// Session 관련 타입
// ============================================

/** 세션 생성 응답 (POST /sessions/) */
export interface CreateSessionResponse {
  session_id: string;
  user_id: number;
  title: string;
  created_at: string | null;
}

/** 세션 목록 항목 */
export interface SessionItem {
  sid: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

/** 세션 목록 응답 (GET /sessions/) */
export interface ListSessionsResponse {
  sessions: SessionItem[];
}

/** 세션 삭제 응답 (DELETE /sessions/{session_id}) */
export interface DeleteSessionResponse {
  message: string;
}

// ============================================
// Message 관련 타입
// ============================================

/** 메시지 역할 */
export type MessageRole = "user" | "assistant";

/** 메시지 항목 */
export interface MessageItem {
  role: MessageRole;
  content: string;
  created_at: string;
  type?: "text" | "schedule_result"; // 메시지 타입 확장
  metadata?: any; // 추가 데이터 (예: 생성된 시간표 개수 등)
}

/** Chat 모드 타입 */
export type ChatMode = "chat" | "schedule";

/** 메시지 전송 요청 (POST /chat/message) */
export interface MessageRequest {
  session_id: string;
  message: string;
  user_id?: number | null;
  mode?: ChatMode;
  language?: string; // 사용자 언어 설정 (e.g., 'ko', 'en')
}

/** 메시지 전송 응답 */
export interface MessageResponse {
  text: string;
  done: boolean;
  type?: "text" | "schedule_result";
  schedules?: import("./schedule").Schedule[];
}

/** 세션 메시지 목록 응답 (GET /sessions/{session_id}/messages) */
export interface GetMessagesResponse {
  session_id: string;
  messages: MessageItem[];
}

// ============================================
// Profile 관련 타입
// ============================================

/** 프로필 저장/수정 요청 (POST /profiles/) */
export interface ProfileRequest {
  profile_name?: string | null;
  student_id?: string | null;
  college?: string | null;
  department?: string | null;
  major?: string | null;
  current_grade?: number | null; // 1-5
  current_semester?: number | null; // 1-2
}

/** 프로필 응답 (GET /profiles/, POST /profiles/) */
export interface ProfileResponse {
  id: number;
  user_id: number;
  profile_name: string;
  student_id: string;
  college: string;
  department: string;
  major: string;
  current_grade: number;
  current_semester: number;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================
// Subject Proxy 관련 타입 (선택적)
// ============================================

/** 과목 검색 요청 */
export interface SubjectSearchRequest {
  keyword: string;
  year?: string | null;
  semester?: string | null;
}

/** 강의계획서 상세 조회 요청 */
export interface SubjectDetailRequest {
  params: string;
}

// ============================================
// 공통 에러 타입
// ============================================

/** 유효성 검사 에러 상세 */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** HTTP 유효성 검사 에러 */
export interface HTTPValidationError {
  detail: ValidationErrorDetail[];
}

/** API 에러 응답 */
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}
