/**
 * 인앱 브라우저 감지 및 외부 브라우저 리다이렉트 유틸리티
 *
 * 구글 정책상 WebView나 인앱 브라우저에서 OAuth 로그인이 차단됩니다.
 * 이 유틸리티는 인앱 브라우저를 감지하고, 외부 브라우저로 리다이렉트하는 기능을 제공합니다.
 */

export interface InAppBrowserInfo {
  isInAppBrowser: boolean;
  browserName: string | null;
  canOpenExternalBrowser: boolean;
}

/**
 * 인앱 브라우저인지 감지합니다.
 * 지원 감지 브라우저: 카카오톡, 에브리타임, 네이버 앱, 인스타그램, 페이스북, 라인, 트위터/X, 당근마켓, 밴드, 틱톡
 */
export const detectInAppBrowser = (): InAppBrowserInfo => {
  // SSR 환경에서는 브라우저가 아니므로 false 반환
  if (typeof navigator === "undefined") {
    return {
      isInAppBrowser: false,
      browserName: null,
      canOpenExternalBrowser: false,
    };
  }

  const ua = navigator.userAgent || navigator.vendor || "";

  // 각 인앱 브라우저별 User-Agent 패턴
  const inAppBrowserPatterns: { pattern: RegExp; name: string }[] = [
    // 한국 주요 앱
    { pattern: /KAKAOTALK/i, name: "KakaoTalk" },
    { pattern: /everytime/i, name: "Everytime" },
    { pattern: /NAVER\(inapp|NAVER\/|NaverMatome/i, name: "Naver" },
    { pattern: /DaumApps|DAUM/i, name: "Daum" },
    { pattern: /CarrotMarket|Daangn/i, name: "당근마켓" },
    { pattern: /BAND\//i, name: "BAND" },
    // 글로벌 SNS
    { pattern: /Instagram/i, name: "Instagram" },
    { pattern: /FBAN|FBAV|FB_IAB/i, name: "Facebook" },
    { pattern: /Line\//i, name: "LINE" },
    { pattern: /Twitter|X-Twitter/i, name: "X (Twitter)" },
    { pattern: /BytedanceWebview|TikTok/i, name: "TikTok" },
    { pattern: /Snapchat/i, name: "Snapchat" },
    { pattern: /Pinterest/i, name: "Pinterest" },
    { pattern: /LinkedIn/i, name: "LinkedIn" },
    // 메신저
    { pattern: /WhatsApp/i, name: "WhatsApp" },
    { pattern: /Telegram/i, name: "Telegram" },
    { pattern: /WeChat|MicroMessenger/i, name: "WeChat" },
    // 일반적인 WebView 감지 (Android) - ; wv) 패턴
    { pattern: /; wv\)/i, name: "Android WebView" },
  ];

  for (const { pattern, name } of inAppBrowserPatterns) {
    if (pattern.test(ua)) {
      return {
        isInAppBrowser: true,
        browserName: name,
        // 안드로이드는 intent 스킴으로 열 수 있고, iOS는 Safari로 리다이렉트 가능
        canOpenExternalBrowser: true,
      };
    }
  }

  // iOS WebView 감지: Safari 식별자가 없는 iOS 브라우저
  // Safari는 "Safari/xxx" 문자열을 포함하지만, WebView는 포함하지 않음
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua)) {
    return {
      isInAppBrowser: true,
      browserName: "iOS WebView",
      canOpenExternalBrowser: true,
    };
  }

  return {
    isInAppBrowser: false,
    browserName: null,
    canOpenExternalBrowser: false,
  };
};

/**
 * iOS 기기인지 확인합니다.
 */
export const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
};

/**
 * Android 기기인지 확인합니다.
 */
export const isAndroid = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
};

/**
 * 외부 브라우저로 현재 페이지를 엽니다.
 *
 * Android: Chrome Intent 스킴 사용 (Chrome 없으면 기본 브라우저로 fallback)
 * iOS 카카오톡: kakaotalk://web/openExternal 스킴 사용
 * iOS 라인: line://nv/article 스킴 사용
 * iOS 기타: window.open 시도 (대부분 작동하지 않음)
 *
 * @returns boolean - 외부 브라우저 열기 시도 성공 여부 (false면 수동 안내 필요)
 */
export const openInExternalBrowser = (
  url?: string,
  browserInfo?: InAppBrowserInfo,
): boolean => {
  const targetUrl = url || window.location.href;
  const info = browserInfo || detectInAppBrowser();

  if (isAndroid()) {
    // Android: Intent 스킴을 사용하여 기본 브라우저에서 열기
    // package 미지정 → 시스템 기본 브라우저 사용 (Chrome 비활성화 시에도 동작)
    // S.browser_fallback_url 추가로 Intent 처리 실패 시 URL로 fallback
    const intentUrl = `intent://${targetUrl.replace(
      /^https?:\/\//,
      "",
    )}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
      targetUrl,
    )};end`;
    window.location.href = intentUrl;
    return true;
  }

  if (isIOS()) {
    // iOS: 앱별 URL 스킴 사용
    const encodedUrl = encodeURIComponent(targetUrl);

    switch (info.browserName) {
      case "KakaoTalk":
        // 카카오톡 공식 외부 브라우저 열기 스킴
        window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;
        return true;

      case "LINE":
        // 라인 외부 브라우저 열기 시도
        window.location.href = `line://nv/article?url=${encodedUrl}`;
        return true;

      case "Naver":
        // 네이버 앱 외부 브라우저 열기 시도
        window.location.href = `naversearchapp://open?url=${encodedUrl}`;
        return true;

      case "Facebook":
      case "Instagram":
        // 페이스북/인스타그램은 공식 스킴 없음 - 수동 안내 필요
        return false;

      default:
        // 기타 인앱 브라우저: window.open 시도 (대부분 작동 안함)
        window.open(targetUrl, "_blank");
        return false;
    }
  }

  // 기타 환경: 새 창으로 열기
  window.open(targetUrl, "_blank");
  return true;
};

/**
 * 현재 인앱 브라우저에서 외부 브라우저 자동 열기가 지원되는지 확인합니다.
 */
export const canAutoOpenExternalBrowser = (
  info?: InAppBrowserInfo,
): boolean => {
  const browserInfo = info || detectInAppBrowser();

  if (!browserInfo.isInAppBrowser) return false;

  if (isAndroid()) {
    // Android는 Intent 스킴으로 항상 가능
    return true;
  }

  if (isIOS()) {
    // iOS에서 지원되는 앱들
    const supportedApps = ["KakaoTalk", "LINE", "Naver"];
    return browserInfo.browserName
      ? supportedApps.includes(browserInfo.browserName)
      : false;
  }

  return false;
};

/**
 * URL을 클립보드에 복사합니다.
 */
export const copyToClipboard = async (text?: string): Promise<boolean> => {
  const textToCopy = text || window.location.href;

  try {
    await navigator.clipboard.writeText(textToCopy);
    return true;
  } catch {
    // Fallback: execCommand 사용 (deprecated but still works in most browsers)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.setAttribute("readonly", ""); // 모바일에서 키보드가 뜨는 것 방지
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, textToCopy.length); // iOS 지원
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
};
