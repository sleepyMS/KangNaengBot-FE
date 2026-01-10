# KangNaengBot-FE (강냉봇 프론트엔드)

강남대학교 학생들을 위한 AI 챗봇 서비스 **강냉봇**의 프론트엔드 프로젝트입니다.
사용자에게 친숙한 대화형 인터페이스를 통해 학교 생활에 필요한 정보를 쉽고 빠르게 제공합니다.

> 💡 **주요 기능**: AI 채팅 상담 | **자연어 기반 시간표 자동 생성** | 4개국어 지원 | 다크모드

## 📚 프로젝트 문서 (Documentation)

개발 과정, 기술적 의사결정, 배운 점 등을 상세하게 정리한 문서들입니다.

- **[🚀 주요 기능 및 구현 상세 (Features)](docs/FEATURES.md)**
  - 채팅 시스템, 시간표 만들기, 인증, 다국어 지원, 테마 등 핵심 기능의 구현 방식
- **[⚡ 최적화 및 성능 개선 (Optimizations)](docs/OPTIMIZATIONS.md)**
  - 낙관적 UI, 데이터 프리페칭, 캐싱 전략 등 UX 향상을 위한 노력
- **[🔥 트러블 슈팅 (Challenges & Solutions)](docs/CHALLENGES_AND_SOLUTIONS.md)**
  - 개발 중 직면한 기술적 난관과 이를 극복한 해결 과정
- **[💡 회고 (Learnings)](docs/LEARNINGS.md)**
  - 프로젝트를 통해 배우고 느낀 점

---

## 🛠 기술 스택 (Tech Stack)

| 구분 (Category)          | 기술 (Technology)                                                                                                                                                                                      | 설명 (Description)              |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| **Framework**            | ![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) | UI 라이브러리 및 정적 타입 언어 |
| **Build Tool**           | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)                                                                                                                 | 빠른 개발 서버 및 번들링 툴     |
| **Styling**              | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)                                                                                          | 유틸리티 퍼스트 CSS 프레임워크  |
| **State Management**     | ![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat)                                                                                                                                     | 가볍고 직관적인 전역 상태 관리  |
| **Data Fetching**        | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)                                                                                                              | HTTP 클라이언트                 |
| **Internationalization** | ![i18next](https://img.shields.io/badge/i18next-26A69A?style=flat&logo=i18next&logoColor=white)                                                                                                        | 다국어 지원 (KO, EN, JA, ZH)    |

## 🚀 시작하기 (Getting Started)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정해야 합니다. (예시)

```env
VITE_API_BASE_URL=https://your-api-url.com
```

## 📂 프로젝트 구조

```
src/
├── api/          # Axios 클라이언트 및 API 서비스
├── components/   # 재사용 가능한 UI 컴포넌트
│   ├── chat/     # 채팅 관련 컴포넌트
│   ├── common/   # 공통 컴포넌트 (버튼, 모달 등)
│   ├── schedule/ # 시간표 생성 관련 컴포넌트 (Canvas, Grid, Filter 등)
│   └── settings/ # 설정 관련 컴포넌트
├── pages/        # 라우트 페이지
├── store/        # Zustand 상태 관리 (useChatStore, useScheduleStore 등)
├── i18n/         # 다국어 리소스
├── types/        # TypeScript 타입 정의
└── utils/        # 유틸리티 함수
```
