[← 메인으로 돌아가기](../README.md)

# 주요 구현 기능 (Features)

현재 프로젝트인 **KangNaengBot-FE**에 구현된 주요 기능과 구현 방식에 대한 상세 설명입니다.

## 1. AI 시간표 생성 시스템 (Schedule Generation)

**자연어 입력만으로 최적의 수업 시간표를 자동 생성**하는 핵심 기능입니다. 사용자가 "알고리즘, 데이터베이스, 컴퓨터네트워크 강의를 포함해서 18학점짜리 시간표 짜줘"라고 입력하면, AI가 RAG에서 과목을 파싱하고 가능한 모든 조합을 계산하여 최적의 시간표들을 제시합니다.

### 핵심 기능

- **자연어 기반 과목 인식**: 과목명만 나열하면 AI가 자동으로 파싱
- **시간표 조합 생성**: 충돌 없는 모든 가능한 시간표 조합 탐색
- **캐러셀 뷰**: 생성된 여러 시간표를 좌우 스와이프로 비교
- **실시간 필터링**: API 재호출 없이 즉시 적용되는 클라이언트 사이드 필터
- **시간표 저장/불러오기**: 마음에 드는 시간표를 이름 지정 후 보관

### 구현 상세

#### 상태 관리 (`useScheduleStore`)

시간표 기능의 모든 상태를 통합 관리하는 Zustand 스토어입니다:

```typescript
type ScheduleStatus = "idle" | "parsing" | "generating" | "complete" | "error";
type ViewMode = "generated" | "saved";

// 핵심 상태
- allSchedules: Schedule[]        // 원본 시간표 (필터 적용 전)
- generatedSchedules: Schedule[]  // 필터링된 시간표
- savedSchedules: SavedSchedule[] // 저장된 시간표
- filters: ScheduleFilters        // 공강 요일, 제외 시간대
```

#### 컴포넌트 아키텍처

| 컴포넌트            | 역할                                                    |
| ------------------- | ------------------------------------------------------- |
| `ScheduleCanvas`    | 메인 컨테이너: 캐러셀, 필터, 액션 버튼 통합             |
| `ScheduleGrid`      | 시간표 시각화: 분 단위 그리드, 충돌 표시, 다크모드 지원 |
| `ScheduleCarousel`  | 시간표 목록 좌우 네비게이션                             |
| `FilterPanel`       | 공강 요일 및 시간대 제외 필터                           |
| `CourseDetailModal` | 과목 상세 정보 (교수, 강의실, 학점)                     |
| `SavedScheduleList` | 사이드바 보관함 목록                                    |

#### 클라이언트 사이드 필터링

```typescript
// 필터 변경 시 로컬에서 즉시 처리 (API 호출 0건)
applyFilters: () => {
  const { allSchedules, filters } = get();
  const filtered = allSchedules.filter((schedule) => {
    // 공강 요일 필터: 해당 요일에 수업 있으면 제외
    // 제외 시간대 필터: globalExcludedSlots와 겹치면 제외
  });
  set({ generatedSchedules: filtered });
};
```

#### 동적 시간표 그리드

주간/야간 수업 학생 모두에게 최적화된 뷰를 제공하기 위해 **동적 시간 범위 렌더링**을 구현했습니다:

- **자동 범위 계산**: 시간표에 포함된 과목들의 시작/종료 시간을 분석하여 그리드 범위 결정
- **주간 학생**: 09:00~18:00 컴팩트 뷰
- **야간 학생**: 09:00~22:00 확장 뷰
- **CSS Grid 활용**: `auto-fit`, `minmax()`로 시간대 수에 따라 셀 크기 자동 조절

#### 개발 방법론

기획이 완전하지 않은 상태에서 **애자일 방식**으로 빠르게 MVP를 구현했습니다:

- **프론트엔드 우선 개발**: Mock 데이터로 UI/UX 선 검증 후 백엔드 연동
- **API 명세서 작성**: [`SCHEDULE_API_SPEC.md`](./SCHEDULE_API_SPEC.md)를 프론트엔드 관점에서 선행 작성하여 백엔드와 병렬 개발

## 2. 채팅 시스템 (Chat System)

채팅 기능은 이 애플리케이션의 핵심으로, 사용자 경험(UX)을 극대화하기 위해 다양한 기술이 적용되었습니다.

### 주요 기능 및 구현 방식

- **상태 관리**: `Zustand`를 사용하여 `useChatStore`에서 세션, 메시지, 로딩 상태 등을 전역적으로 관리합니다.
- **낙관적 UI (Optimistic UI)**:
  - 메시지 전송 시 서버 응답을 기다리지 않고 즉시 UI에 사용자의 메시지를 표시합니다.
  - `sendMessage` 함수 내에서 `set`을 통해 로컬 메시지 배열을 먼저 업데이트하고, 백그라운드에서 API 호출을 수행합니다.
  - 실패 시 `messages.slice(0, -1)`을 통해 롤백하여 데이터 일관성을 유지합니다.
- **재시도 로직 (Retry Logic)**:
  - AI 응답이 비어있거나 실패할 경우를 대비하여 `sendMessage` 내부에서 최대 5회, 500ms 간격으로 재시도하는 로직을 구현했습니다.
  - 이를 통해 일시적인 네트워크 오류나 서버 지연에 강건하게 대응합니다.
- **세션 관리**:
  - 첫 메시지 전송 시 자동으로 세션을 생성(`createSession`)하고, 이후 메시지는 해당 세션 ID(`sid`)로 전송됩니다.
  - 게스트 모드 지원을 위해 `guestUserId`를 별도로 관리합니다.

## 3. 다국어 지원 (Global i18n)

`react-i18next`를 도입하여 한국어, 영어, 일본어, 중국어 4개 국어를 지원합니다.

### 구현 상세

- **설정 (`i18n/index.ts`)**: 언어 리소스를 JSON 파일로 관리하며, 초기 로드 시 브라우저 언어 감지 또는 저장된 설정을 따릅니다.
- **UI 컴포넌트 (`LanguageSwitcher.tsx`)**:
  - 드롭다운 메뉴를 통해 언어를 실시간으로 변경할 수 있습니다.
  - 변경 시 `useSettingsStore`와 `i18next` 인스턴스를 동기화하여 앱 전체에 즉시 반영됩니다.

## 4. 인증 및 보안 (Authentication)

`Axios` 인터셉터를 활용하여 안전하고 효율적인 인증 흐름을 구현했습니다.

### 구현 상세

- **API 클라이언트 (`apiClient.ts`)**:
  - `axios.create`로 기본 설정을 중앙화했습니다.
  - **Request Interceptor**: 모든 요청의 헤더에 `localStorage`에 저장된 `access_token`을 자동으로 Bearer 토큰으로 추가합니다.
  - **Response Interceptor**:
    - `401 Unauthorized` 에러 발생 시 자동으로 토큰을 삭제하고 로그인 페이지로 리다이렉트 처리하여 보안을 강화했습니다.
    - 기타 에러(403, 404, 500 등)에 대해 표준화된 에러 메시지를 반환하도록 처리했습니다.

## 5. 테마 시스템 (Dark/Light Mode)

사용자의 편의를 위해 다크 모드, 라이트 모드, 시스템 설정을 모두 지원합니다.

### 구현 상세

- **Tailwind CSS**: `darkMode: 'class'` 설정을 사용하여 HTML root 요소의 클래스(`dark`) 유무에 따라 스타일을 제어합니다.
- **상태 관리 (`useSettingsStore.ts`)**:
  - `persist` 미들웨어를 사용하여 사용자의 테마 설정을 로컬 스토리지에 영구 저장합니다.
  - `system` 모드 선택 시 `window.matchMedia('(prefers-color-scheme: dark')` 리스너를 등록하여 OS 테마 변경에 실시간으로 반응합니다.

## 6. 프로필 관리 (`ProfileModal.tsx`)

복잡한 학교 조직도(단과대 -> 학부 -> 전공)를 효율적으로 선택할 수 있는 폼을 구현했습니다.

### 구현 상세

- **계층형 드롭다운**:
  - 단과대학 선택 시 학부 목록이 필터링되고, 학부 선택 시 전공 목록이 필터링되는 의존성(Dependency) 관계를 구현했습니다.
  - 상태 변경 시 하위 선택값을 자동으로 초기화하여 데이터 무결성을 보장합니다.
- **반응형 디자인**:
  - `window.innerWidth`를 감지하여 모바일과 데스크톱에서 서로 다른 레이아웃(전체 화면 모달 vs 팝업 모달)을 렌더링합니다.
