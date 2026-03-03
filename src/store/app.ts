import { create } from "zustand";
import type { Player } from "@/types/player";

export type AppPhase = "idle" | "auth" | "onboarding" | "ready" | "error";

/** Шаг онбординг-тура на главной: 0 = статы, 1 = действия, 2 = навигация, 3 = финал, "done" = завершён */
export type OnboardingTourStep = 0 | 1 | 2 | 3 | "done";

const ONBOARDING_TOUR_STORAGE_KEY = "devlife_onboarding_tour_done";

export function getOnboardingTourDoneKey(playerId: string): string {
  return `${ONBOARDING_TOUR_STORAGE_KEY}_${playerId}`;
}

export function isOnboardingTourDone(playerId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getOnboardingTourDoneKey(playerId)) === "1";
}

export function setOnboardingTourDone(playerId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getOnboardingTourDoneKey(playerId), "1");
}

interface LastEvent {
  title: string;
  description: string;
  hint?: string;
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
  /** Только на главной: шаг тура или "done" */
  onboardingTourStep: OnboardingTourStep;
  actions: {
    setInitData: (value: string) => void;
    setTelegramReady: (ready: boolean) => void;
    setPlayer: (player: Player | null) => void;
    setLoading: (value: boolean) => void;
    setError: (message: string | null) => void;
    setNeedsOnboarding: (value: boolean) => void;
    setPhase: (phase: AppPhase) => void;
    setLastEvent: (event: LastEvent | null) => void;
    setOnboardingTourStep: (step: OnboardingTourStep) => void;
    finishOnboardingTour: (playerId: string) => void;
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
  onboardingTourStep: "done",
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
    setOnboardingTourStep: (step) => set({ onboardingTourStep: step }),
    finishOnboardingTour: (playerId) => {
      setOnboardingTourDone(playerId);
      set({ onboardingTourStep: "done" });
    },
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
        onboardingTourStep: "done",
      })),
  },
}));
