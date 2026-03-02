import { create } from "zustand";
import type { Player } from "@/types/player";

export type AppPhase = "idle" | "auth" | "onboarding" | "ready" | "error";

interface LastEvent {
  title: string;
  description: string;
}

interface AppState {
  initData: string;
  telegramReady: boolean;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  phase: AppPhase;
  lastEvent: LastEvent | null;
  actions: {
    setInitData: (value: string) => void;
    setTelegramReady: (ready: boolean) => void;
    setPlayer: (player: Player | null) => void;
    setLoading: (value: boolean) => void;
    setError: (message: string | null) => void;
    setNeedsOnboarding: (value: boolean) => void;
    setPhase: (phase: AppPhase) => void;
    setLastEvent: (event: LastEvent | null) => void;
    reset: () => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  initData: "",
  telegramReady: false,
  player: null,
  isLoading: true,
  error: null,
  needsOnboarding: false,
  phase: "idle",
  lastEvent: null,
  actions: {
    setInitData: (value) =>
      set((state) => ({
        initData: value,
        phase: state.phase === "idle" ? "auth" : state.phase,
      })),
    setTelegramReady: (ready) => set({ telegramReady: ready }),
    setPlayer: (player) =>
      set(() => ({
        player,
        phase: player ? "ready" : "auth",
      })),
    setLoading: (value) => set({ isLoading: value }),
    setError: (message) =>
      set(() => ({
        error: message,
        phase: message ? "error" : "ready",
      })),
    setNeedsOnboarding: (value) =>
      set(() => ({
        needsOnboarding: value,
        phase: value ? "onboarding" : "ready",
      })),
    setPhase: (phase) => set({ phase }),
    setLastEvent: (event) => set({ lastEvent: event }),
    reset: () =>
      set(() => ({
        initData: "",
        telegramReady: false,
        player: null,
        isLoading: false,
        error: null,
        needsOnboarding: false,
        phase: "idle",
        lastEvent: null,
      })),
  },
}));
