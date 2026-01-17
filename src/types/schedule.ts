/**
 * 시간표 관련 타입 정의
 */

// 요일 타입
export type Day = "mon" | "tue" | "wed" | "thu" | "fri";

// 시간 슬롯 (24시간 형식)
export interface TimeSlot {
  day: Day;
  startTime: string; // "09:00" 형식 (HH:MM)
  endTime: string; // "12:00" 형식 (HH:MM)
  location?: string;
}

// 과목
export interface Course {
  id: string;
  name: string;
  code: string;
  courseNumber?: string; // 학수번호 (code와 동일할 수 있음)
  section?: string; // 분반 (예: "03")
  professor: string;
  credits: number;
  slots: TimeSlot[];
  category: "major" | "liberal" | "other";
  isRequired?: boolean;
  color?: string; // 시각적 구분용 색상
}

// 애매한 과목 (여러 후보)
export interface AmbiguousCourse {
  input: string;
  candidates: Course[];
  selectedIndex: number | null;
}

// 시간표 경고
export interface ScheduleWarning {
  type: "capacity_full" | "prerequisite_missing" | "time_conflict_risk";
  courseId: string;
  message: string;
}

// 생성된 시간표
export interface Schedule {
  id: string;
  rank?: number; // 시간표 순위 (1, 2, 3...)
  courses: Course[];
  totalCredits: number;
  emptyDays: Day[];
  compactScore: number; // 0~100
  warnings: (ScheduleWarning | string)[]; // 문자열 또는 객체 형태 모두 지원
  recommendations: string[];
  savedId?: string; // 저장된 경우 해당 ID
}

// 저장된 시간표
export interface SavedSchedule extends Schedule {
  savedAt: string;
  name: string;
  isFavorite: boolean;
}

// 필터 설정 (시간 기반)
export interface ScheduleFilters {
  maxCredits: number | null;
  emptyDays: Day[];
  excludeTimeRanges: { day: Day; startTime: string; endTime: string }[]; // 제외할 시간대
  preferCompact: boolean;
}

// 에러 타입
export interface ScheduleError {
  type:
    | "parse_failed"
    | "no_courses"
    | "generation_failed"
    | "all_conflict"
    | "timeout";
  message: string;
  retryable: boolean;
}

// API 응답 타입
export interface ParseCoursesResponse {
  courses: Course[];
  ambiguous: AmbiguousCourse[];
  notFound: string[];
  extractedFilters: Partial<ScheduleFilters>;
  message?: string;
}

export interface GenerateSchedulesResponse {
  success: boolean;
  schedules: Schedule[];
  warnings: ScheduleWarning[];
  message?: string; // AI 생성 메시지 (선택적)
  fallback?: {
    reason: "all_conflict" | "no_courses";
    suggestions: string[];
  };
}

export interface BackendSavedSchedule {
  created_at: string;
  id: string;
  schedule_data: Schedule | { schedules: Schedule[] };
  title: string;
  updated_at: string;
  user_id: number;
}
