import apiClient from "../apiClient";
import type {
  MessageRequest,
  MessageResponse,
  SSECallbacks,
  SSEEvent,
  SSEScheduleEvent,
} from "@/types";

// API 기본 URL (환경 변수에서 가져옴)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://agent-backend-api-88199591627.us-east4.run.app";

/**
 * 메시지 전송 및 AI 응답 받기 (기존 방식 - 호환성 유지)
 * @param request 메시지 요청 데이터
 * @deprecated SSE 스트리밍 방식인 sendMessageStream 사용 권장
 */
export const sendMessage = async (
  request: MessageRequest
): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(
    "/chat/message",
    request
  );
  return response.data;
};

/**
 * 메시지 전송 및 SSE 스트리밍 응답 처리
 * @param request 메시지 요청 데이터
 * @param callbacks SSE 이벤트별 콜백 함수
 * @param abortSignal 요청 취소 시그널 (선택)
 */
export const sendMessageStream = async (
  request: MessageRequest,
  callbacks: SSECallbacks,
  abortSignal?: AbortSignal
): Promise<void> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
    signal: abortSignal,
    credentials: "include", // HttpOnly 쿠키 전송
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // SSE 이벤트 파싱 (줄바꿈으로 구분)
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 마지막 불완전한 줄은 버퍼에 유지

      for (const line of lines) {
        const trimmedLine = line.trim();

        // 빈 줄 또는 주석 무시
        if (!trimmedLine || trimmedLine.startsWith(":")) {
          continue;
        }

        // "data: " 접두사 제거
        if (trimmedLine.startsWith("data: ")) {
          const jsonStr = trimmedLine.slice(6);

          try {
            const event: SSEEvent = JSON.parse(jsonStr);

            // 이벤트 타입에 따라 콜백 호출
            switch (event.type) {
              case "thinking":
                callbacks.onThinking?.(event.content, event.message);
                break;
              case "tool":
                callbacks.onTool?.(event.tool_name, event.message);
                break;
              case "tool_result":
                callbacks.onToolResult?.(event.tool_name, event.message);
                break;
              case "text":
                callbacks.onText?.(event.content);
                break;
              case "schedule":
                callbacks.onSchedule?.(event as SSEScheduleEvent);
                break;
              case "done":
                callbacks.onDone?.();
                break;
              case "error":
                callbacks.onError?.(event.message);
                break;
            }
          } catch {
            // JSON 파싱 실패 시 무시 (불완전한 데이터)
            console.warn("SSE JSON parse error:", jsonStr);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
