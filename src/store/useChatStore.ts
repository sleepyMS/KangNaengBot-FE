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
  sendMessage: (message: string) => Promise<void>;
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
    try {
      await sessionsService.deleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.sid !== sessionId),
        currentSessionId:
          state.currentSessionId === sessionId ? null : state.currentSessionId,
        messages: state.currentSessionId === sessionId ? [] : state.messages,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "대화를 삭제하지 못했습니다.",
      });
    }
  },

  sendMessage: async (message: string) => {
    const { currentSessionId, guestUserId } = get();
    if (!currentSessionId) {
      set({ error: "세션이 선택되지 않았습니다." });
      return;
    }

    // 사용자 메시지 즉시 추가
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
      const response = await chatService.sendMessage({
        session_id: currentSessionId,
        message,
        user_id: guestUserId ?? undefined, // 게스트 모드면 guestUserId 사용
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

      // 세션 제목 업데이트 (첫 메시지인 경우)
      if (get().messages.length <= 2) {
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
      set({
        isSending: false,
        error:
          error instanceof Error
            ? error.message
            : "메시지 전송에 실패했습니다.",
      });
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
