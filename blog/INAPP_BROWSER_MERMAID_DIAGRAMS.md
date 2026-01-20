# 인앱 브라우저 해결 시스템 다이어그램

블로그 포스트에 사용할 **핵심 다이어그램 3개**입니다.
[Mermaid Live Editor](https://mermaid.live/)에서 PNG로 내보내 티스토리에 이미지로 업로드하세요.

---

## 다이어그램 1: 문제 상황 흐름도

**📍 삽입 위치**: `🎯 문제 정의` 섹션, 문제 설명 아래

```mermaid
flowchart TB
    subgraph App["📱 카카오톡 / 에브리타임"]
        A["🔗 링크 클릭"]
    end

    subgraph InApp["🌐 인앱 브라우저 (WebView)"]
        B["강냉봇 로그인 페이지"]
        C["'Google로 계속하기' 클릭"]
    end

    subgraph Google["🔒 Google OAuth"]
        D{"User-Agent 검사"}
        E["❌ 403 Error<br/>disallowed_useragent"]
    end

    A --> B
    B --> C
    C --> D
    D -->|"WebView 감지"| E

    style A fill:#fbbf24,color:#000
    style C fill:#3b82f6,color:#fff
    style E fill:#ef4444,color:#fff
```

---

## 다이어그램 2: 플랫폼별 분기 처리 흐름도

**📍 삽입 위치**: `💡 해결책 1: 앱별 URL 스킴 활용` 섹션, URL 스킴 목록 아래

```mermaid
flowchart TB
    A["🔘 '외부 브라우저에서 열기' 클릭"] --> B["openInExternalBrowser()"]

    B --> C{"플랫폼 감지"}

    C -->|"Android"| D["Intent 스킴 생성<br/>intent://...#Intent;...;end"]
    C -->|"iOS"| E{"앱별 분기"}
    C -->|"기타"| F["window.open()"]

    E -->|"KakaoTalk"| G["kakaotalk://web/<br/>openExternal?url=..."]
    E -->|"LINE"| H["line://nv/<br/>article?url=..."]
    E -->|"Naver"| I["naversearchapp://<br/>open?url=..."]
    E -->|"Instagram<br/>Everytime"| J["return false<br/>(수동 안내)"]

    D --> K["✅ Chrome 열림"]
    G --> L["✅ Safari 열림"]
    H --> L
    I --> L
    J --> M["⚠️ 토스트 메시지<br/>'Safari로 열기' 안내"]
    F --> N["✅ 새 탭 열림"]

    style A fill:#3b82f6,color:#fff
    style C fill:#f59e0b,color:#fff
    style K fill:#10b981,color:#fff
    style L fill:#10b981,color:#fff
    style M fill:#f59e0b,color:#fff
```

---

## 다이어그램 3: 조건부 렌더링 흐름도

**📍 삽입 위치**: `💡 해결책 3: 인앱 브라우저 감지 시 대체 UI` 섹션

```mermaid
flowchart TB
    A["🖥️ LoginPage 렌더링"] --> B["detectInAppBrowser()<br/>User-Agent 분석"]

    B --> C{"isInAppBrowser<br/>=== true ?"}

    C -->|"YES<br/>(카카오톡, 에타 등)"| D["⚠️ 경고 UI 표시"]
    C -->|"NO<br/>(일반 브라우저)"| E["🔐 Google 로그인 버튼"]

    subgraph WarningUI["경고 UI 구성"]
        D --> D1["🚨 경고 아이콘 + 메시지"]
        D1 --> D2["1️⃣ 외부 브라우저에서 열기"]
        D2 --> D3["2️⃣ 링크 복사"]
        D3 --> D4["3️⃣ 게스트로 계속하기"]
    end

    E --> F["Google OAuth 정상 진행"]

    style A fill:#8b5cf6,color:#fff
    style C fill:#f59e0b,color:#fff
    style D fill:#fbbf24,color:#000
    style E fill:#3b82f6,color:#fff
    style F fill:#10b981,color:#fff
```

---

## 다이어그램 4: User-Agent 감지 패턴

**📍 삽입 위치**: `🔍 원인 분석` 섹션, 인앱 브라우저 감지 방법 설명 아래 (선택 사항)

```mermaid
flowchart LR
    subgraph Input["📥 입력"]
        A["navigator.userAgent"]
    end

    subgraph Patterns["🔍 패턴 매칭"]
        B["KAKAOTALK"]
        C["everytime"]
        D["Instagram"]
        E["FBAN/FBAV"]
        F["Line/"]
        G["; wv)"]
    end

    subgraph Output["📤 출력"]
        H["{ isInAppBrowser: true,<br/>browserName: 'KakaoTalk' }"]
        I["{ isInAppBrowser: false,<br/>browserName: null }"]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G

    B -->|"매칭 성공"| H
    C -->|"매칭 성공"| H
    D -->|"매칭 성공"| H
    E -->|"매칭 성공"| H
    F -->|"매칭 성공"| H
    G -->|"매칭 성공"| H
    G -->|"매칭 실패"| I

    style A fill:#3b82f6,color:#fff
    style H fill:#10b981,color:#fff
    style I fill:#6b7280,color:#fff
```

---

## 📋 체크리스트

| #   | 다이어그램           | 블로그 위치                      | PNG 생성 |
| --- | -------------------- | -------------------------------- | :------: |
| 1   | 문제 상황 흐름도     | 🎯 문제 정의                     |    ☐     |
| 2   | 플랫폼별 분기 처리   | 💡 해결책 1 (URL 스킴 목록 아래) |    ☐     |
| 3   | 조건부 렌더링 흐름도 | 💡 해결책 3 (대체 UI 설명)       |    ☐     |
| 4   | User-Agent 감지 패턴 | 🔍 원인 분석 (선택 사항)         |    ☐     |

---

## 사용 방법

1. [Mermaid Live Editor](https://mermaid.live/)에 위 코드 붙여넣기
2. 우측 상단 "Actions" → "PNG" 다운로드
3. 티스토리 에디터에서 해당 위치에 이미지 삽입
4. 블로그 HTML에서 ASCII 다이어그램 부분 삭제 (이미지로 대체)
