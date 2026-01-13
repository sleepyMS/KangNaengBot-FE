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
// SSE 스트리밍 관련 타입
// ============================================

/** SSE 이벤트 타입 */
export type SSEEventType =
  | "thinking"
  | "tool"
  | "tool_result"
  | "text"
  | "schedule"
  | "done"
  | "error";

/** SSE 기본 이벤트 */
export interface SSEBaseEvent {
  type: SSEEventType;
}

/** SSE thinking 이벤트 - AI 추론 과정 */
export interface SSEThinkingEvent extends SSEBaseEvent {
  type: "thinking";
  content: string;
  message: string;
}

/** SSE tool 이벤트 - 도구 실행 시작 */
export interface SSEToolEvent extends SSEBaseEvent {
  type: "tool";
  tool_name: string;
  message: string;
}

/** SSE tool_result 이벤트 - 도구 실행 완료 */
export interface SSEToolResultEvent extends SSEBaseEvent {
  type: "tool_result";
  tool_name: string;
  message: string;
}

/** SSE text 이벤트 - 응답 텍스트 (chunk) */
export interface SSETextEvent extends SSEBaseEvent {
  type: "text";
  content: string;
}

/** SSE schedule 이벤트 - 시간표 결과 */
export interface SSEScheduleEvent extends SSEBaseEvent {
  type: "schedule";
  success: boolean;
  schedules: import("./schedule").Schedule[];
  warnings?: string[];
  message: string;
}

/** SSE done 이벤트 - 스트리밍 완료 */
export interface SSEDoneEvent extends SSEBaseEvent {
  type: "done";
}

/** SSE error 이벤트 - 에러 */
export interface SSEErrorEvent extends SSEBaseEvent {
  type: "error";
  message: string;
}

/** SSE 이벤트 유니온 타입 */
export type SSEEvent =
  | SSEThinkingEvent
  | SSEToolEvent
  | SSEToolResultEvent
  | SSETextEvent
  | SSEScheduleEvent
  | SSEDoneEvent
  | SSEErrorEvent;

/** SSE 스트리밍 콜백 */
export interface SSECallbacks {
  onThinking?: (content: string, message: string) => void;
  onTool?: (toolName: string, message: string) => void;
  onToolResult?: (toolName: string, message: string) => void;
  onText?: (content: string) => void;
  onSchedule?: (data: SSEScheduleEvent) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
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
