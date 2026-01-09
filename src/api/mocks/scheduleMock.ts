/**
 * 시간표 Mock 데이터
 * 백엔드 API 연동 전까지 사용할 샘플 데이터
 */

import type {
  Course,
  Schedule,
  ParseCoursesResponse,
  GenerateSchedulesResponse,
  AmbiguousCourse,
} from "@/types";

// 과목 색상 팔레트
const COURSE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

// 샘플 과목 데이터 (24시간 형식)
export const MOCK_COURSES: Course[] = [
  {
    id: "CSE101-01",
    name: "컴퓨터개론",
    code: "CSE101-01",
    professor: "김철수",
    credits: 3,
    slots: [
      {
        day: "mon",
        startTime: "10:00",
        endTime: "12:00",
        location: "공학관 301",
      },
      {
        day: "wed",
        startTime: "10:00",
        endTime: "12:00",
        location: "공학관 301",
      },
    ],
    category: "major",
    color: COURSE_COLORS[0],
  },
  {
    id: "CSE101-02",
    name: "컴퓨터개론",
    code: "CSE101-02",
    professor: "박영희",
    credits: 3,
    slots: [
      {
        day: "tue",
        startTime: "09:00",
        endTime: "11:00",
        location: "공학관 302",
      },
      {
        day: "thu",
        startTime: "09:00",
        endTime: "11:00",
        location: "공학관 302",
      },
    ],
    category: "major",
    color: COURSE_COLORS[0],
  },
  {
    id: "CSE301-01",
    name: "데이터베이스",
    code: "CSE301-01",
    professor: "이민호",
    credits: 3,
    slots: [
      {
        day: "tue",
        startTime: "11:00",
        endTime: "13:00",
        location: "공학관 201",
      },
      {
        day: "thu",
        startTime: "11:00",
        endTime: "13:00",
        location: "공학관 201",
      },
    ],
    category: "major",
    color: COURSE_COLORS[1],
  },
  {
    id: "CSE301-02",
    name: "데이터베이스",
    code: "CSE301-02",
    professor: "정수진",
    credits: 3,
    slots: [
      {
        day: "mon",
        startTime: "12:00",
        endTime: "14:00",
        location: "공학관 202",
      },
      {
        day: "wed",
        startTime: "12:00",
        endTime: "14:00",
        location: "공학관 202",
      },
    ],
    category: "major",
    color: COURSE_COLORS[1],
  },
  {
    id: "ENG201-01",
    name: "실용영어회화",
    code: "ENG201-01",
    professor: "Smith John",
    credits: 2,
    slots: [
      {
        day: "fri",
        startTime: "09:00",
        endTime: "11:00",
        location: "어학관 101",
      },
    ],
    category: "liberal",
    color: COURSE_COLORS[2],
  },
  {
    id: "ENG202-01",
    name: "비즈니스영어",
    code: "ENG202-01",
    professor: "Johnson Emily",
    credits: 2,
    slots: [
      {
        day: "wed",
        startTime: "14:00",
        endTime: "16:00",
        location: "어학관 102",
      },
    ],
    category: "liberal",
    color: COURSE_COLORS[3],
  },
  {
    id: "CSE401-01",
    name: "인공지능",
    code: "CSE401-01",
    professor: "최지능",
    credits: 3,
    slots: [
      {
        day: "mon",
        startTime: "14:00",
        endTime: "16:00",
        location: "공학관 401",
      },
      {
        day: "wed",
        startTime: "14:00",
        endTime: "16:00",
        location: "공학관 401",
      },
    ],
    category: "major",
    color: COURSE_COLORS[4],
  },
  {
    id: "CSE201-01",
    name: "자료구조",
    code: "CSE201-01",
    professor: "한구조",
    credits: 3,
    slots: [
      {
        day: "tue",
        startTime: "13:00",
        endTime: "15:00",
        location: "공학관 303",
      },
      {
        day: "thu",
        startTime: "13:00",
        endTime: "15:00",
        location: "공학관 303",
      },
    ],
    category: "major",
    isRequired: true,
    color: COURSE_COLORS[5],
  },
  {
    id: "GEN101-01",
    name: "채플",
    code: "GEN101-01",
    professor: "목사님",
    credits: 0.5,
    slots: [
      { day: "thu", startTime: "16:00", endTime: "17:00", location: "채플실" },
    ],
    category: "other",
    isRequired: true,
    color: COURSE_COLORS[6],
  },
  {
    id: "CSE302-01",
    name: "운영체제",
    code: "CSE302-01",
    professor: "박시스템",
    credits: 3,
    slots: [
      {
        day: "mon",
        startTime: "16:00",
        endTime: "18:00",
        location: "공학관 305",
      },
      {
        day: "wed",
        startTime: "16:00",
        endTime: "18:00",
        location: "공학관 305",
      },
    ],
    category: "major",
    color: COURSE_COLORS[7],
  },
];

// Mock 시간표 조합 생성
export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "schedule-1",
    courses: [
      MOCK_COURSES[0], // 컴퓨터개론 김철수
      MOCK_COURSES[2], // 데이터베이스 이민호
      MOCK_COURSES[4], // 실용영어회화
      MOCK_COURSES[8], // 채플
    ],
    totalCredits: 8.5,
    emptyDays: [],
    compactScore: 75,
    warnings: [],
    recommendations: ["빈 시간이 적은 효율적인 시간표예요!"],
  },
  {
    id: "schedule-2",
    courses: [
      MOCK_COURSES[1], // 컴퓨터개론 박영희
      MOCK_COURSES[3], // 데이터베이스 정수진
      MOCK_COURSES[5], // 비즈니스영어
      MOCK_COURSES[8], // 채플
    ],
    totalCredits: 8.5,
    emptyDays: ["tue", "fri"],
    compactScore: 60,
    warnings: [],
    recommendations: ["화요일, 금요일 공강이 있어요!"],
  },
  {
    id: "schedule-3",
    courses: [
      MOCK_COURSES[0], // 컴퓨터개론 김철수
      MOCK_COURSES[3], // 데이터베이스 정수진
      MOCK_COURSES[6], // 인공지능
      MOCK_COURSES[8], // 채플
    ],
    totalCredits: 9.5,
    emptyDays: ["tue"],
    compactScore: 80,
    warnings: [],
    recommendations: ["AI 관심 있으시면 이 조합 추천!"],
  },
  {
    id: "schedule-4",
    courses: [
      MOCK_COURSES[1], // 컴퓨터개론 박영희
      MOCK_COURSES[2], // 데이터베이스 이민호
      MOCK_COURSES[7], // 자료구조
      MOCK_COURSES[8], // 채플
    ],
    totalCredits: 9.5,
    emptyDays: ["mon", "wed", "fri"],
    compactScore: 55,
    warnings: [],
    recommendations: ["월/수/금 공강!"],
  },
  {
    id: "schedule-5",
    courses: [
      MOCK_COURSES[0], // 컴퓨터개론 김철수
      MOCK_COURSES[2], // 데이터베이스 이민호
      MOCK_COURSES[6], // 인공지능
      MOCK_COURSES[9], // 운영체제
      MOCK_COURSES[8], // 채플
    ],
    totalCredits: 12.5,
    emptyDays: ["fri"],
    compactScore: 85,
    warnings: [],
    recommendations: ["전공 집중! 금요일 공강으로 프로젝트 시간 확보!"],
  },
];

// Mock API 함수들
export const mockParseCoursesFromMessage = async (
  message: string
): Promise<ParseCoursesResponse> => {
  // 시뮬레이션 딜레이
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerMessage = message.toLowerCase();
  const courses: Course[] = [];
  const ambiguous: AmbiguousCourse[] = [];
  const notFound: string[] = [];

  // 간단한 키워드 매칭
  if (lowerMessage.includes("컴개론") || lowerMessage.includes("컴퓨터개론")) {
    // 여러 분반이 있으므로 ambiguous로 처리
    ambiguous.push({
      input: "컴퓨터개론",
      candidates: [MOCK_COURSES[0], MOCK_COURSES[1]],
      selectedIndex: null,
    });
  }

  if (lowerMessage.includes("데베") || lowerMessage.includes("데이터베이스")) {
    ambiguous.push({
      input: "데이터베이스",
      candidates: [MOCK_COURSES[2], MOCK_COURSES[3]],
      selectedIndex: null,
    });
  }

  if (lowerMessage.includes("영어") || lowerMessage.includes("영회화")) {
    ambiguous.push({
      input: "영어회화",
      candidates: [MOCK_COURSES[4], MOCK_COURSES[5]],
      selectedIndex: null,
    });
  }

  if (lowerMessage.includes("인공지능") || lowerMessage.includes("ai")) {
    courses.push(MOCK_COURSES[6]);
  }

  if (lowerMessage.includes("자료구조")) {
    courses.push(MOCK_COURSES[7]);
  }

  if (lowerMessage.includes("운영체제") || lowerMessage.includes("os")) {
    courses.push(MOCK_COURSES[9]);
  }

  // 필터 추출
  const extractedFilters: Partial<import("@/types").ScheduleFilters> = {};
  if (lowerMessage.includes("금공강") || lowerMessage.includes("금요일 공강")) {
    extractedFilters.emptyDays = ["fri"];
  }
  if (
    lowerMessage.includes("1교시 싫") ||
    lowerMessage.includes("아침 싫") ||
    lowerMessage.includes("9시 싫")
  ) {
    // 09:00~10:00 제외
    extractedFilters.excludeTimeRanges = [
      { day: "mon", startTime: "09:00", endTime: "10:00" },
      { day: "tue", startTime: "09:00", endTime: "10:00" },
      { day: "wed", startTime: "09:00", endTime: "10:00" },
      { day: "thu", startTime: "09:00", endTime: "10:00" },
      { day: "fri", startTime: "09:00", endTime: "10:00" },
    ];
  }

  // 매칭된 게 없으면 notFound
  if (courses.length === 0 && ambiguous.length === 0) {
    notFound.push(message);
  }

  return {
    courses,
    ambiguous,
    notFound,
    extractedFilters,
    message:
      courses.length > 0 || ambiguous.length > 0
        ? "과목을 찾았어요! 확인해주세요."
        : "입력하신 과목을 찾지 못했어요. 다시 입력해주세요.",
  };
};

export const mockGenerateSchedules = async (
  courseIds: string[]
): Promise<GenerateSchedulesResponse> => {
  // 시뮬레이션 딜레이
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // courseIds에 해당하는 과목들로 필터링된 시간표 반환
  const selectedCourses = MOCK_COURSES.filter((c) => courseIds.includes(c.id));

  if (selectedCourses.length === 0) {
    return {
      success: false,
      schedules: [],
      warnings: [],
      message: "선택된 과목이 없어요.",
      fallback: {
        reason: "no_courses",
        suggestions: ["컴퓨터개론", "데이터베이스", "자료구조"],
      },
    };
  }

  // 선택된 과목을 포함하는 시간표들만 필터링
  const matchingSchedules = MOCK_SCHEDULES.filter((schedule) =>
    selectedCourses.some((course) =>
      schedule.courses.some((c) => c.id === course.id)
    )
  );

  return {
    success: true,
    schedules:
      matchingSchedules.length > 0
        ? matchingSchedules
        : MOCK_SCHEDULES.slice(0, 3),
    warnings: [],
    message:
      matchingSchedules.length > 0
        ? "요청하신 과목들로 시간표 조합을 찾아냈어요! 1공학관 이동 동선을 고려해서 최적의 조합을 추천해 드려요. 금요일 공강도 챙겨봤습니다! 😊"
        : "요청하신 조건에 완벽히 맞는 시간표를 찾기 어려워서, 가장 비슷한 대안들을 몇 가지 가져와봤어요.",
  };
};

export const mockGenerateSchedulesFromText = async (
  message: string
): Promise<GenerateSchedulesResponse> => {
  // 1. 파싱 로직 재사용
  const parseResult = await mockParseCoursesFromMessage(message);

  // 2. 자동 확정 (Auto-confirm)
  const confirmedIds: string[] = [];

  // 확정된 과목 ID
  parseResult.courses.forEach((c) => confirmedIds.push(c.id));

  // 애매한 과목은 첫 번째 후보 ID 사용
  parseResult.ambiguous.forEach((amb) => {
    if (amb.candidates.length > 0) {
      confirmedIds.push(amb.candidates[0].id);
    }
  });

  // 3. 생성 로직 호출
  if (confirmedIds.length === 0) {
    return {
      success: false,
      schedules: [],
      warnings: [],
      message: "입력하신 과목을 찾지 못했어요.",
      fallback: {
        reason: "no_courses",
        suggestions: ["컴퓨터개론", "데이터베이스"],
      },
    };
  }

  return mockGenerateSchedules(confirmedIds);
};
