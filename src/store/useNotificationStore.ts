import { create } from "zustand";

interface NotiState {
  enabled: boolean;
  offset: number;
  permissionGranted: boolean;
}

interface NotificationStore extends NotiState {
  // Actions
  setNotiState: (state: Partial<NotiState>) => void;
  syncWithNative: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  // Initial State
  enabled: false,
  offset: 10,
  permissionGranted: false,

  // Actions
  setNotiState: (newState) => set((state) => ({ ...state, ...newState })),

  syncWithNative: () => {
    if (typeof window !== "undefined" && window.sendToNative) {
      window.sendToNative("GET_NOTI_STATE", {});
    }
  },
}));
