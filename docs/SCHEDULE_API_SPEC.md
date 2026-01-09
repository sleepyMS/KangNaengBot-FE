# 시간표 API 명세서

> 프론트엔드에서 기대하는 API 응답 구조입니다. 이 명세대로 구현해 주세요.

---

## 📌 Overview

| Endpoint                   | Method | 설명                               |
| -------------------------- | ------ | ---------------------------------- |
| `/schedules/generate/text` | POST   | 자연어 → 시간표 생성 (Single Step) |
| `/schedules/saved`         | GET    | 저장된 시간표 목록 조회            |
| `/schedules/saved`         | POST   | 시간표 저장                        |
| `/schedules/saved/{id}`    | DELETE | 저장된 시간표 삭제                 |

---

## 1. 시간표 생성 (Single Step)

### `POST /schedules/generate/text`

자연어 입력을 받아 시간표를 생성합니다.

#### Request

```json
{
  "session_id": "abc123",
  "message": "컴퓨터개론, 데이터베이스, 자료구조 넣어줘. 금요일 공강이면 좋겠어"
}
```

| Field        | Type   | Required | Description        |
| ------------ | ------ | -------- | ------------------ |
| `session_id` | string | ✅       | 채팅 세션 ID       |
| `message`    | string | ✅       | 사용자 자연어 입력 |

#### Response

```json
{
  "success": true,
  "schedules": [
    {
      "id": "schedule-1",
      "courses": [
        {
          "id": "CSE101-01",
          "name": "컴퓨터개론",
          "code": "CSE101-01",
          "professor": "김철수",
          "credits": 3,
          "slots": [
            {
              "day": "mon",
              "startTime": "10:00",
              "endTime": "12:00",
              "location": "공학관 301"
            },
            {
              "day": "wed",
              "startTime": "10:00",
              "endTime": "12:00",
              "location": "공학관 301"
            }
          ],
          "category": "major",
          "isRequired": false,
          "color": "#3B82F6"
        }
      ],
      "totalCredits": 12,
      "emptyDays": ["fri"],
      "compactScore": 85,
      "warnings": [],
      "recommendations": ["금요일 공강으로 프로젝트 시간 확보!"]
    }
  ],
  "warnings": [],
  "message": "요청하신 과목들로 시간표 조합을 찾아냈어요! 금요일 공강도 챙겨봤습니다! 😊"
}
```

#### Response 필드 설명

| 필드        | 타입              | 필수 | 설명                                                    |
| ----------- | ----------------- | ---- | ------------------------------------------------------- |
| `success`   | boolean           | ✅   | API 호출 성공 여부 (`true`: 성공, `false`: 실패)        |
| `schedules` | Schedule[]        | ✅   | 생성된 시간표 배열 (여러 조합 가능)                     |
| `warnings`  | ScheduleWarning[] | ✅   | 전체 경고 메시지 배열 (수강신청 경쟁률 등)              |
| `message`   | string            | ❌   | **UI에 표시할 AI 응답 메시지** (친근한 톤, 이모지 권장) |
| `fallback`  | object            | ❌   | 시간표 생성 실패 시 대안 정보                           |

#### Schedule 객체 필드 설명

| 필드              | 타입              | 필수 | 설명                                                  | 예시                                      |
| ----------------- | ----------------- | ---- | ----------------------------------------------------- | ----------------------------------------- |
| `id`              | string            | ✅   | 시간표 고유 식별자                                    | `"schedule-1"`                            |
| `courses`         | Course[]          | ✅   | 이 시간표에 포함된 과목 배열                          | 아래 Course 참조                          |
| `totalCredits`    | number            | ✅   | **총 학점 합계**                                      | `12`                                      |
| `emptyDays`       | Day[]             | ✅   | **공강 요일 배열** (수업이 없는 요일)                 | `["fri"]` = 금요일 공강                   |
| `compactScore`    | number            | ✅   | **응집도 점수** (0~100). 빈 시간 없이 촘촘할수록 높음 | `85`                                      |
| `warnings`        | ScheduleWarning[] | ✅   | 이 시간표의 개별 경고 목록                            | `[]`                                      |
| `recommendations` | string[]          | ✅   | **AI 추천 코멘트** (UI 하단에 표시)                   | `["금요일 공강으로 프로젝트 시간 확보!"]` |

#### Course 객체 필드 설명

| 필드         | 타입       | 필수 | 설명                                         | 예시           |
| ------------ | ---------- | ---- | -------------------------------------------- | -------------- |
| `id`         | string     | ✅   | 과목 고유 ID (학수번호-분반)                 | `"CSE101-01"`  |
| `name`       | string     | ✅   | 과목명                                       | `"컴퓨터개론"` |
| `code`       | string     | ✅   | 과목 코드                                    | `"CSE101-01"`  |
| `professor`  | string     | ✅   | 담당 교수명                                  | `"김철수"`     |
| `credits`    | number     | ✅   | 학점                                         | `3`            |
| `slots`      | TimeSlot[] | ✅   | 수업 시간 슬롯 배열 (주 2회면 2개)           | 아래 참조      |
| `category`   | string     | ✅   | 과목 분류: `"major"`, `"liberal"`, `"other"` | `"major"`      |
| `isRequired` | boolean    | ❌   | 필수 과목 여부                               | `false`        |
| `color`      | string     | ❌   | **시간표 표시용 색상** (HEX 코드)            | `"#3B82F6"`    |

#### TimeSlot 객체 필드 설명

| 필드        | 타입   | 필수 | 설명                                              | 예시           |
| ----------- | ------ | ---- | ------------------------------------------------- | -------------- |
| `day`       | Day    | ✅   | 요일: `"mon"`, `"tue"`, `"wed"`, `"thu"`, `"fri"` | `"mon"`        |
| `startTime` | string | ✅   | **시작 시간** (HH:MM 형식, 24시간)                | `"10:00"`      |
| `endTime`   | string | ✅   | **종료 시간** (HH:MM 형식, 24시간)                | `"12:00"`      |
| `location`  | string | ❌   | 강의실                                            | `"공학관 301"` |

---

## 2. 저장된 시간표 목록 조회

### `GET /schedules/saved`

사용자의 저장된 시간표 목록을 반환합니다.

#### Request

- Headers: `Authorization: Bearer {access_token}`

#### Response

```json
{
  "schedules": [
    {
      "id": "saved-uuid-1",
      "name": "1학기 최종",
      "courses": [...],
      "totalCredits": 18,
      "emptyDays": ["fri"],
      "compactScore": 90,
      "warnings": [],
      "recommendations": [],
      "savedAt": "2026-01-09T08:30:00Z",
      "isFavorite": false
    }
  ]
}
```

---

## 3. 시간표 저장

### `POST /schedules/saved`

시간표를 저장합니다.

#### Request

```json
{
  "id": "saved-uuid-generated-by-frontend",
  "name": "내 첫 번째 시간표",
  "courses": [...],
  "totalCredits": 15,
  "emptyDays": ["fri"],
  "compactScore": 75,
  "warnings": [],
  "recommendations": [],
  "savedAt": "2026-01-09T09:00:00Z",
  "isFavorite": false
}
```

#### Response

```json
{
  "success": true,
  "id": "saved-uuid-generated-by-frontend"
}
```

---

## 4. 저장된 시간표 삭제

### `DELETE /schedules/saved/{id}`

저장된 시간표를 삭제합니다.

#### Request

- URL Param: `id` - 삭제할 시간표 ID
- Headers: `Authorization: Bearer {access_token}`

#### Response

```json
{
  "success": true,
  "message": "시간표가 삭제되었습니다."
}
```

---

## 📐 데이터 타입 정의

### Day (요일)

```typescript
type Day = "mon" | "tue" | "wed" | "thu" | "fri";
```

### TimeSlot (시간 슬롯)

```typescript
interface TimeSlot {
  day: Day; // 요일
  startTime: string; // 시작 시간 (HH:MM 형식, 예: "09:00")
  endTime: string; // 종료 시간 (HH:MM 형식, 예: "12:00")
  location?: string; // 강의실 (선택)
}
```

### Course (과목)

```typescript
interface Course {
  id: string; // 고유 ID (예: "CSE101-01")
  name: string; // 과목명
  code: string; // 과목 코드
  professor: string; // 담당 교수
  credits: number; // 학점
  slots: TimeSlot[]; // 수업 시간 (여러 슬롯 가능)
  category: "major" | "liberal" | "other"; // 분류
  isRequired?: boolean; // 필수 과목 여부
  color?: string; // 표시 색상 (HEX, 예: "#3B82F6")
}
```

### Schedule (생성된 시간표)

```typescript
interface Schedule {
  id: string; // 시간표 ID
  courses: Course[]; // 포함된 과목 목록
  totalCredits: number; // 총 학점
  emptyDays: Day[]; // 공강 요일 목록
  compactScore: number; // 응집도 점수 (0~100)
  warnings: ScheduleWarning[]; // 경고 목록
  recommendations: string[]; // AI 추천 코멘트
}
```

### SavedSchedule (저장된 시간표)

```typescript
interface SavedSchedule extends Schedule {
  savedAt: string; // 저장 시각 (ISO 8601)
  name: string; // 사용자 지정 이름
  isFavorite: boolean; // 즐겨찾기 여부
}
```

### ScheduleWarning (경고)

```typescript
interface ScheduleWarning {
  type: "capacity_full" | "prerequisite_missing" | "time_conflict_risk";
  courseId: string;
  message: string;
}
```

### GenerateSchedulesResponse (시간표 생성 응답)

```typescript
interface GenerateSchedulesResponse {
  success: boolean; // 성공 여부
  schedules: Schedule[]; // 생성된 시간표 목록
  warnings: ScheduleWarning[]; // 전체 경고
  message?: string; // AI 응답 메시지 (UI에 표시)
  fallback?: {
    // 실패 시 대안 정보
    reason: "all_conflict" | "no_courses";
    suggestions: string[];
  };
}
```

---

## ⚡ 주의사항

1. **시간 형식**: 24시간 형식 HH:MM 문자열 (예: `"09:00"`, `"14:30"`)
2. **시간 범위**: 09:00 ~ 21:00 권장 (12시간)
3. **색상**: 프론트엔드에서 사용할 HEX 색상 코드 (`#RRGGBB`)
4. **emptyDays**: 해당 시간표에서 수업이 없는 요일 배열
5. **compactScore**: 빈 시간이 적을수록 높은 점수 (0~100)
6. **message**: AI 스타일 친근한 응답 메시지 (이모지 사용 권장)

---

## 🧪 테스트용 Mock 응답 예시

현재 프론트엔드는 API 실패 시 아래와 같은 Mock 데이터를 사용합니다:

```json
{
  "success": true,
  "schedules": [
    {
      "id": "schedule-1",
      "courses": [
        {
          "id": "CSE101-01",
          "name": "컴퓨터개론",
          "code": "CSE101-01",
          "professor": "김철수",
          "credits": 3,
          "slots": [
            {
              "day": "mon",
              "startTime": "10:00",
              "endTime": "12:00",
              "location": "공학관 301"
            },
            {
              "day": "wed",
              "startTime": "10:00",
              "endTime": "12:00",
              "location": "공학관 301"
            }
          ],
          "category": "major",
          "color": "#3B82F6"
        },
        {
          "id": "CSE301-01",
          "name": "데이터베이스",
          "code": "CSE301-01",
          "professor": "이민호",
          "credits": 3,
          "slots": [
            {
              "day": "tue",
              "startTime": "11:00",
              "endTime": "13:00",
              "location": "공학관 201"
            },
            {
              "day": "thu",
              "startTime": "11:00",
              "endTime": "13:00",
              "location": "공학관 201"
            }
          ],
          "category": "major",
          "color": "#10B981"
        }
      ],
      "totalCredits": 6,
      "emptyDays": ["fri"],
      "compactScore": 75,
      "warnings": [],
      "recommendations": ["빈 시간이 적은 효율적인 시간표예요!"]
    }
  ],
  "warnings": [],
  "message": "요청하신 과목들로 시간표 조합을 찾아냈어요! 금요일 공강도 챙겨봤습니다! 😊"
}
```

---

## 📞 문의

프론트엔드 담당자에게 문의해 주세요.
