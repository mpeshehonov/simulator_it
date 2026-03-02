"use client";

import { useEffect, useCallback } from "react";
import type { ActionType } from "@/types/game";
import type { Player } from "@/types/player";
import { useAppStore } from "@/store/app";

interface UsePlayerOptions {
  initData: string;
}

interface UsePlayerResult {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  completeOnboarding: (profession: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  doAction: (action: ActionType) => Promise<{
    ok: boolean;
    event?: { title: string; description: string; tone: string };
    expGained?: number;
    moneyGained?: number;
  } | null>;
}

const defaultFetchOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export function usePlayer({ initData }: UsePlayerOptions): UsePlayerResult {
  const { player, isLoading, error, needsOnboarding, actions } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const hasPlayer = useAppStore.getState().player != null;
      if (!hasPlayer) {
        actions.setLoading(true);
        actions.setError(null);
        actions.setNeedsOnboarding(false);
      }
      try {
        if (!initData) {
          actions.setPlayer(null);
          return;
        }
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          ...defaultFetchOptions,
          body: JSON.stringify({ initData }),
        });
        if (cancelled) return;
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (data.needsOnboarding) {
            actions.setNeedsOnboarding(true);
            actions.setPlayer(null);
          } else if (data.player) {
            actions.setPlayer(data.player);
          }
        } else {
          actions.setPlayer(null);
          actions.setError("Auth failed");
        }
      } catch {
        if (!cancelled) {
          actions.setError("Network error");
          actions.setPlayer(null);
        }
      } finally {
        if (!cancelled && !hasPlayer) actions.setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [initData, actions]);

  const completeOnboarding = useCallback(
    async (profession: string): Promise<boolean> => {
      if (!initData) return false;
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        ...defaultFetchOptions,
        body: JSON.stringify({ initData, profession }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.player) {
        actions.setPlayer(data.player);
        actions.setNeedsOnboarding(false);
        return true;
      }
      return false;
    },
    [initData, actions]
  );

  const refresh = useCallback(async () => {
    if (!initData) return;
    actions.setLoading(true);
    try {
      const opts: RequestInit = {
        ...defaultFetchOptions,
        headers: {
          ...defaultFetchOptions.headers,
          "X-Telegram-Init-Data": initData,
        } as HeadersInit,
      };
      const res = await fetch("/api/player", opts);
      if (res.ok) {
        const { player: p } = await res.json();
        actions.setPlayer(p);
      }
    } finally {
      actions.setLoading(false);
    }
  }, [initData, actions]);

  const doAction = useCallback(
    async (action: ActionType) => {
      if (!player) return null;
      const opts: RequestInit = {
        method: "POST",
        ...defaultFetchOptions,
        body: JSON.stringify({ action }),
        headers: {
          ...defaultFetchOptions.headers,
          ...(initData ? { "X-Telegram-Init-Data": initData } : {}),
        } as HeadersInit,
      };
      const res = await fetch("/api/player/action", opts);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        actions.setPlayer(data.player);
        return {
          ok: true,
          event: data.event,
          expGained: data.expGained,
          moneyGained: data.moneyGained,
        };
      }
      return { ok: false };
    },
    [player, initData, actions]
  );

  return {
    player,
    isLoading,
    error,
    needsOnboarding,
    completeOnboarding,
    refresh,
    doAction,
  };
}
