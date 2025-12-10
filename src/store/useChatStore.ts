import { create } from "zustand";
import type { MessageItem, SessionItem } from "@/types";
import { sessionsService, chatService } from "@/api";

interface ChatState {
  // State
  sessions: SessionItem[];
  currentSessionId: string | null;
  guestUserId: number | null; // 게스트 모드에서 사용할 임시 user_id
  messages: MessageItem[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  createSession: () => Promise<string>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (
    message: string,
    createSessionIfNeeded?: boolean
  ) => Promise<void>;
  addMessage: (message: MessageItem) => void;
  clearCurrentSession: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  sessions: [],
  currentSessionId: null,
  guestUserId: null, // 게스트 모드 임시 user_id
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  // Actions
  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionsService.listSessions();
      set({ sessions: response.sessions, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "세션 목록을 불러오지 못했습니다.",
      });
    }
  },

  createSession: async () => {
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
        messages: [],
        isLoading: false,
      }));
      return response.session_id;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "새 대화를 시작하지 못했습니다.",
      });
      throw error;
    }
  },

  selectSession: async (sessionId: string) => {
    set({ isLoading: true, error: null, currentSessionId: sessionId });

    try {
      const response = await sessionsService.getSessionMessages(sessionId);
      set({
        messages: response.messages,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "대화 내용을 불러오지 못했습니다.",
      });
    }
  },

  deleteSession: async (sessionId: string) => {
    const { sessions, currentSessionId, messages } = get();

    // 1. 낙관적 UI: 즉시 세션 삭제 (UI 먼저 업데이트)
    const deletedSession = sessions.find((s) => s.sid === sessionId);
    const wasCurrentSession = currentSessionId === sessionId;

    set({
      sessions: sessions.filter((s) => s.sid !== sessionId),
      currentSessionId: wasCurrentSession ? null : currentSessionId,
      messages: wasCurrentSession ? [] : messages,
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
              : "대화를 삭제하지 못했습니다.",
        }));
      }
    }
  },

  sendMessage: async (
    message: string,
    createSessionIfNeeded: boolean = false
  ) => {
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
          // 첫 메시지로 제목 설정
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          is_active: true,
          created_at: response.created_at || new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: response.session_id,
          guestUserId: response.user_id,
        }));
      }

      if (!currentSessionId) {
        set({ error: "세션이 선택되지 않았습니다.", isSending: false });
        return;
      }

      const response = await chatService.sendMessage({
        session_id: currentSessionId,
        message,
        user_id: guestUserId ?? undefined,
      });

      // AI 응답 추가
      const assistantMessage: MessageItem = {
        role: "assistant",
        content: response.text,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isSending: false,
      }));

      // 세션 제목 업데이트 (첫 메시지인 경우, 새 세션이 아닌 기존 세션일 때만)
      if (!needsNewSession && get().messages.length <= 2) {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.sid === currentSessionId
              ? {
                  ...s,
                  title:
                    message.slice(0, 50) + (message.length > 50 ? "..." : ""),
                }
              : s
          ),
        }));
      }
    } catch (error) {
      // 실패 시 낙관적 메시지 롤백
      set((state) => ({
        messages: needsNewSession ? [] : state.messages.slice(0, -1),
        isSending: false,
        error:
          error instanceof Error
            ? error.message
            : "메시지 전송에 실패했습니다.",
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
}));
