/**
 * 네이티브 앱 브릿지 전역 타입 선언
 * React Native WebView에서 주입되는 전역 변수들
 */

export {};

declare global {
  interface Window {
    /** 네이티브 앱 내에서 실행 중인지 여부 */
    IS_NATIVE_APP?: boolean;

    /** 플랫폼 (ios | android) */
    PLATFORM?: "ios" | "android";

    /** 게스트 모드 여부 */
    IS_GUEST?: boolean;

    /** 네이티브 시스템 테마 (dark | light) */
    NATIVE_THEME?: "dark" | "light";

    /** 네이티브 시스템 언어 (예: ko-KR, en-US) */
    NATIVE_LOCALE?: string;

    /**
     * 네이티브 앱에 메시지 전송
     * @param type 메시지 타입
     * @param payload 추가 데이터
     */
    sendToNative?: (type: string, payload?: unknown) => void;

    /** React Native WebView 객체 */
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
