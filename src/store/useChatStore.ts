import { create } from "zustand";
import type {
  MessageItem,
  SessionItem,
  ChatMode,
  SSEScheduleData,
} from "@/types";
import { sessionsService, chatService } from "@/api";
import i18n from "@/i18n";
import { useScheduleStore } from "./useScheduleStore";

// 진행 중인 프리페치 요청을 추적하기 위한 Map (컴포넌트 외부에 선언)
const pendingPrefetches = new Map<string, Promise<MessageItem[]>>();

interface ChatState {
  // State
  sessions: SessionItem[];
  currentSessionId: string | null;
  guestUserId: number | null; // 게스트 모드에서 사용할 임시 user_id
  messages: MessageItem[];
  messageCache: Map<string, MessageItem[]>; // 세션별 메시지 캐시
  isLoading: boolean;
  isSending: boolean;
  sendingSessionId: string | null; // 현재 응답 생성 중인 세션 ID
  error: string | null;
  streamingMessage: string | null; // SSE 스트리밍 상태 메시지 (UI 표시용)
  abortController: AbortController | null; // 스트리밍 취소용

  // Actions
  fetchSessions: () => Promise<void>;
  createSession: (keepMessages?: boolean) => Promise<string>;
  selectSession: (sessionId: string, forceRefresh?: boolean) => Promise<void>;
  prefetchSession: (sessionId: string) => void; // 호버 프리페칭용
  deleteSession: (sessionId: string) => Promise<void>;
  deleteAllSessions: () => Promise<void>;
  sendMessage: (
    message: string,
    options?: {
      createSessionIfNeeded?: boolean;
      mode?: ChatMode;
    },
  ) => Promise<void>;
  addMessage: (message: MessageItem) => void;
  clearCurrentSession: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  sessions: [],
  currentSessionId: null,
  guestUserId: null, // 게스트 모드 임시 user_id
  messages: [],
  messageCache: new Map(), // 세션별 메시지 캐시
  isLoading: true, // 초기 로딩 시 스피너 표시
  isSending: false,
  sendingSessionId: null,
  error: null,
  streamingMessage: null, // SSE 상태 메시지
  abortController: null, // 스트리밍 취소 컨트롤러

  // Actions
  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionsService.listSessions();
      set({ sessions: response.sessions, isLoading: false });

      // 최근 5개 세션의 메시지를 백그라운드에서 즉시 프리로드
      const sessionsToPreload = response.sessions.slice(0, 5);
      const { messageCache } = get();

      sessionsToPreload.forEach((session) => {
        // 이미 캐시에 있거나 프리페치 진행 중이면 스킵
        if (
          messageCache.has(session.sid) ||
          pendingPrefetches.has(session.sid)
        ) {
          return;
        }

        const prefetchPromise = sessionsService
          .getSessionMessages(session.sid)
          .then((res) => {
            const newCache = new Map(get().messageCache);
            newCache.set(session.sid, res.messages);
            set({ messageCache: newCache });
            return res.messages;
          })
          .finally(() => {
            pendingPrefetches.delete(session.sid);
          });

        pendingPrefetches.set(session.sid, prefetchPromise);
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.error.sessionList"),
      });
    }
  },

  createSession: async (keepMessages = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionsService.createSession();
      const newSession: SessionItem = {
        sid: response.session_id,
        title: response.title,
        is_active: true,
        created_at: response.created_at || new Date().toISOString(),
      };
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: response.session_id,
        guestUserId: response.user_id, // 세션 생성 시 user_id 저장 (게스트 모드용)
        messages: keepMessages ? state.messages : [],
        isLoading: false,
      }));
      return response.session_id;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.error.createSession"),
      });
      throw error;
    }
  },

  selectSession: async (sessionId: string, forceRefresh: boolean = false) => {
    const { messageCache } = get();
    const cachedMessages = messageCache.get(sessionId);

    // 캐시가 있으면 즉시 표시 (낙관적 UI)
    if (cachedMessages && !forceRefresh) {
      set({
        currentSessionId: sessionId,
        messages: cachedMessages,
        isLoading: false,
        error: null,
      });

      // 백그라운드에서 최신 데이터 가져오기 (조용히 업데이트)
      sessionsService
        .getSessionMessages(sessionId)
        .then((response) => {
          const newCache = new Map(get().messageCache);
          newCache.set(sessionId, response.messages);

          // 현재 세션이면 UI도 업데이트
          if (get().currentSessionId === sessionId) {
            set({ messages: response.messages, messageCache: newCache });
          } else {
            set({ messageCache: newCache });
          }
        })
        .catch(() => {
          // 백그라운드 에러는 무시 (캐시 데이터 사용 중)
        });
      return;
    }

    // 진행 중인 프리페치가 있으면 해당 요청을 재사용
    const pendingPrefetch = pendingPrefetches.get(sessionId);
    if (pendingPrefetch && !forceRefresh) {
      set({
        isLoading: true,
        error: null,
        currentSessionId: sessionId,
        messages: [],
      });

      try {
        const messages = await pendingPrefetch;
        // 프리페치가 완료되면 캐시도 업데이트됨
        set({
          messages,
          isLoading: false,
        });
        return;
      } catch {
        // 프리페치 실패 시 아래에서 새로 요청
      }
    }

    // 캐시도 없고 프리페치도 없으면 로딩 표시 후 API 호출
    // messages를 즉시 비워서 이전 세션 대화가 보이지 않도록 함
    set({
      isLoading: true,
      error: null,
      currentSessionId: sessionId,
      messages: [],
    });

    try {
      const response = await sessionsService.getSessionMessages(sessionId);
      const newCache = new Map(get().messageCache);
      newCache.set(sessionId, response.messages);

      set({
        messages: response.messages,
        messageCache: newCache,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.error.fetchMessages"),
      });
    }
  },

  // 호버 프리페칭: UI 상태 변경 없이 백그라운드에서 데이터 로드
  prefetchSession: (sessionId: string) => {
    const { messageCache } = get();

    // 이미 캐시가 있으면 프리페칭 불필요
    if (messageCache.has(sessionId)) {
      return;
    }

    // 이미 프리페치 진행 중이면 중복 요청 방지
    if (pendingPrefetches.has(sessionId)) {
      return;
    }

    // 백그라운드에서 조용히 데이터 로드
    const prefetchPromise = sessionsService
      .getSessionMessages(sessionId)
      .then((response) => {
        const newCache = new Map(get().messageCache);
        newCache.set(sessionId, response.messages);
        set({ messageCache: newCache });
        return response.messages;
      })
      .finally(() => {
        // 완료 후 pending에서 제거
        pendingPrefetches.delete(sessionId);
      });

    // pending에 저장
    pendingPrefetches.set(sessionId, prefetchPromise);
  },

  deleteSession: async (sessionId: string) => {
    const { sessions, currentSessionId, messages } = get();

    // 1. 낙관적 UI: 즉시 세션 삭제 (UI 먼저 업데이트)
    const deletedSession = sessions.find((s) => s.sid === sessionId);
    const wasCurrentSession = currentSessionId === sessionId;

    // 캐시도 삭제
    const newCache = new Map(get().messageCache);
    newCache.delete(sessionId);

    set({
      sessions: sessions.filter((s) => s.sid !== sessionId),
      currentSessionId: wasCurrentSession ? null : currentSessionId,
      messages: wasCurrentSession ? [] : messages,
      messageCache: newCache,
    });

    try {
      // 2. 백엔드 API 호출
      await sessionsService.deleteSession(sessionId);
    } catch (error) {
      // 3. 실패 시 롤백: 삭제 취소
      if (deletedSession) {
        set((state) => ({
          sessions: [deletedSession, ...state.sessions],
          currentSessionId: wasCurrentSession
            ? sessionId
            : state.currentSessionId,
          error:
            error instanceof Error
              ? error.message
              : i18n.t("store.error.deleteSession"),
        }));
      }
    }
  },

  deleteAllSessions: async () => {
    const { sessions, currentSessionId } = get();

    // 세션이 없으면 아무것도 하지 않음
    if (sessions.length === 0) return;

    // 1. 낙관적 UI: 모든 세션 즉시 삭제
    const deletedSessions = [...sessions];
    const wasCurrentSession = currentSessionId !== null;

    // 모든 캐시 삭제
    set({
      sessions: [],
      currentSessionId: null,
      messages: [],
      messageCache: new Map(),
    });

    try {
      // 2. 백엔드 API 호출 (모든 세션 삭제)
      await Promise.all(
        deletedSessions.map((session) =>
          sessionsService.deleteSession(session.sid),
        ),
      );
    } catch (error) {
      // 3. 실패 시 롤백
      set(() => ({
        sessions: deletedSessions,
        currentSessionId: wasCurrentSession
          ? deletedSessions[0]?.sid || null
          : null,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.error.deleteSession"),
      }));
    }
  },

  sendMessage: async (
    message: string,
    options?: {
      createSessionIfNeeded?: boolean;
      mode?: ChatMode;
    },
  ) => {
    const createSessionIfNeeded = options?.createSessionIfNeeded ?? false;
    const mode = options?.mode ?? "chat";
    let { currentSessionId, guestUserId } = get();

    // 세션이 없고, 새 세션 생성이 필요한 경우 (첫 메시지)
    const needsNewSession = !currentSessionId && createSessionIfNeeded;

    // 낙관적 UI: 사용자 메시지 즉시 표시
    const userMessage: MessageItem = {
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isSending: true,
      sendingSessionId: currentSessionId,
      error: null,
    }));

    try {
      // 세션이 필요하면 먼저 생성 (낙관적이지만 메시지는 이미 보여주고 있음)
      if (needsNewSession) {
        const response = await sessionsService.createSession();
        currentSessionId = response.session_id;
        guestUserId = response.user_id;

        const newSession: SessionItem = {
          sid: response.session_id,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          is_active: true,
          created_at: response.created_at || new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: response.session_id,
          guestUserId: response.user_id,
          sendingSessionId: response.session_id, // Update to new session ID
        }));
      }

      const targetSessionId = currentSessionId as string; // Closure capture for callbacks, confirmed not null above

      if (!targetSessionId) {
        set({
          error: i18n.t("store.error.sessionNotSelected"),
          isSending: false,
          sendingSessionId: null,
        });
        return;
      }

      // 시간표 모드일 때 생성 상태로 전환 (세션 ID 확정 후)
      if (mode === "schedule") {
        useScheduleStore.setState({
          status: "generating",
          relatedSessionId: targetSessionId,
        });
      }

      // 캐시에도 사용자 메시지 즉시 반영 (세션 이동 시 소실 방지)
      set((state) => {
        const newCache = new Map(state.messageCache);
        const existingMessages = newCache.get(targetSessionId) || [];
        // 낙관적 업데이트 중복 방지: 마지막 메시지와 동일하면 캐시 업데이트 스킵
        if (existingMessages.length > 0) {
          const last = existingMessages[existingMessages.length - 1];
          if (
            last.created_at === userMessage.created_at &&
            last.content === userMessage.content
          ) {
            return {};
          }
        }

        newCache.set(targetSessionId, [...existingMessages, userMessage]);
        return { messageCache: newCache };
      });

      // 진행 중인 스트리밍 취소
      get().abortController?.abort();

      // 새 AbortController 생성
      const abortController = new AbortController();
      set({ abortController, streamingMessage: null });

      // 응답 텍스트 누적용
      let accumulatedText = "";
      let scheduleData: SSEScheduleData | null = null;

      // SSE 스트리밍 호출
      await chatService.sendMessageStream(
        {
          session_id: targetSessionId,
          message,
          user_id: guestUserId ?? undefined,
          mode,
          language: i18n.language,
        },
        {
          onThinking: (_content, statusMessage) => {
            if (get().currentSessionId === targetSessionId) {
              set({ streamingMessage: statusMessage });
            }
          },
          onTool: (_toolName, statusMessage) => {
            if (get().currentSessionId === targetSessionId) {
              set({ streamingMessage: statusMessage });
            }
          },
          onToolResult: (_toolName, statusMessage) => {
            if (get().currentSessionId === targetSessionId) {
              set({ streamingMessage: statusMessage });
            }
          },
          onText: (chunk) => {
            accumulatedText += chunk;
            // 스트리밍 메시지 초기화 (텍스트가 오면 로딩 표시 끝)
            if (get().currentSessionId === targetSessionId) {
              set({ streamingMessage: null });
            }
          },
          onSchedule: (data) => {
            scheduleData = data;
            // 시간표 결과를 Schedule store에 전달
            // 현재 보고 있는 세션(currentSessionId)이 아니라,
            // 시간표 생성을 요청했던 세션(relatedSessionId)과 일치하는 경우에만 업데이트
            const scheduleStoreState = useScheduleStore.getState();
            if (
              data.success &&
              data.schedules?.length &&
              scheduleStoreState.relatedSessionId === targetSessionId
            ) {
              scheduleStoreState.setGeneratedSchedules(data.schedules);
            }
          },
          onDone: () => {
            // 1. 항상 캐시 업데이트 (백그라운드 완료 지원)
            const { messageCache, currentSessionId, sendingSessionId } = get();

            let finalMessage: MessageItem;

            if (
              scheduleData &&
              scheduleData.success &&
              scheduleData.schedules?.length
            ) {
              finalMessage = {
                role: "assistant",
                content:
                  scheduleData.message ||
                  i18n.t("schedule.status.found", {
                    count: scheduleData.schedules.length,
                  }),
                created_at: new Date().toISOString(),
                type: "schedule_result",
                metadata: {
                  scheduleCount: scheduleData.schedules.length,
                  schedules: scheduleData.schedules,
                },
              };
              // 시간표 모드 완료 처리
              // 사용자가 다른 세션에 있어도, store의 상태는 업데이트되어야 함 (단, 요청 세션과 일치할 때)
              const scheduleStoreState = useScheduleStore.getState();
              if (
                mode === "schedule" &&
                scheduleStoreState.relatedSessionId === targetSessionId
              ) {
                useScheduleStore.setState({ status: "complete" });
              }
            } else if (accumulatedText.trim()) {
              finalMessage = {
                role: "assistant",
                content: accumulatedText,
                created_at: new Date().toISOString(),
              };
              // 일반 텍스트 완료
              const scheduleStoreState = useScheduleStore.getState();
              if (
                mode === "schedule" &&
                scheduleStoreState.relatedSessionId === targetSessionId
              ) {
                useScheduleStore.setState({ status: "idle" });
              }
            } else {
              finalMessage = {
                role: "assistant",
                content: i18n.t("store.error.emptyResponseFallback"),
                created_at: new Date().toISOString(),
              };
              // 빈 응답 완료
              const scheduleStoreState = useScheduleStore.getState();
              if (
                mode === "schedule" &&
                scheduleStoreState.relatedSessionId === targetSessionId
              ) {
                useScheduleStore.setState({ status: "idle" });
              }
            }

            // 캐시 업데이트
            const newCache = new Map(messageCache);
            const sessionMessages = newCache.get(targetSessionId) || [];
            // 마지막 user 메시지 이후에 추가되어야 함 (이미 캐시에 user msg가 있다고 가정)
            // 하지만 여기서는 안전하게 전체 리스트를 다시 구성하거나 append
            // fetchSessions 등에서 캐시를 초기화했을 수 있으므로 주의

            // 기존 캐시에 append
            newCache.set(targetSessionId, [...sessionMessages, finalMessage]);

            // 2. 현재 세션이 targetSessionId와 같으면 UI 업데이트
            if (currentSessionId === targetSessionId) {
              set({
                streamingMessage: null,
                abortController: null,
                messages: [...get().messages, finalMessage],
                isSending: false,
                sendingSessionId: null,
                messageCache: newCache,
              });
            } else {
              // 다른 세션에 있으면 캐시만 업데이트하고 전송 상태 해제 (만약 내가 보낸 요청이었다면)
              set((state) => ({
                messageCache: newCache,
                // 만약 내가 보낸 요청이 끝난거라면 isSending false
                isSending:
                  state.sendingSessionId === targetSessionId
                    ? false
                    : state.isSending,
                sendingSessionId:
                  state.sendingSessionId === targetSessionId
                    ? null
                    : state.sendingSessionId,
              }));
            }

            // 세션 제목 업데이트 (비동기라 체크 필요)
            set((state) => ({
              sessions: state.sessions.map((s) =>
                s.sid === targetSessionId && state.messages.length <= 2 // 조건은 대략적임
                  ? {
                      ...s,
                      title:
                        message.slice(0, 50) +
                        (message.length > 50 ? "..." : ""),
                    }
                  : s,
              ),
            }));
          },
          onError: (errorMessage) => {
            set({ streamingMessage: null, abortController: null });
            throw new Error(errorMessage);
          },
        },
        abortController.signal,
      );
    } catch (error) {
      // schedule 모드였으면 status 초기화 (에러 상태로)
      if (mode === "schedule") {
        useScheduleStore.setState({
          status: "error",
          error: {
            type: "generation_failed",
            message:
              error instanceof Error
                ? error.message
                : i18n.t("store.error.sendMessage"),
            retryable: true,
          },
        });
      }

      // 실패 시 낙관적 메시지 롤백
      set((state) => ({
        messages: needsNewSession ? [] : state.messages.slice(0, -1),
        isSending: false,
        sendingSessionId: null, // Reset sending session
        streamingMessage: null,
        abortController: null,
        error:
          error instanceof Error
            ? error.message
            : i18n.t("store.error.sendMessage"),
      }));
    }
  },

  addMessage: (message: MessageItem) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearCurrentSession: () => {
    set({ currentSessionId: null, messages: [] });
  },

  clearError: () => set({ error: null }),

  reset: () => {
    pendingPrefetches.clear();
    set({
      sessions: [],
      currentSessionId: null,
      guestUserId: null,
      messages: [],
      messageCache: new Map(),
      isLoading: true,
      isSending: false,
      sendingSessionId: null,
      error: null,
    });
  },
}));
