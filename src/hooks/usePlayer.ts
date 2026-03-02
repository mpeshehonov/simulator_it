"use client";

import { useState, useEffect, useCallback } from "react";
import type { Player } from "@/types/player";
import type { ActionType } from "@/types/game";

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
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setNeedsOnboarding(false);
      try {
        if (!initData) {
          setPlayer(null);
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
            setNeedsOnboarding(true);
            setPlayer(null);
          } else if (data.player) {
            setPlayer(data.player);
          }
        } else {
          setPlayer(null);
          setError("Auth failed");
        }
      } catch {
        if (!cancelled) {
          setError("Network error");
          setPlayer(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [initData]);

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
        setPlayer(data.player);
        setNeedsOnboarding(false);
        return true;
      }
      return false;
    },
    [initData]
  );

  const refresh = useCallback(async () => {
    if (!initData) return;
    setIsLoading(true);
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
        setPlayer(p);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initData]);

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
        setPlayer(data.player);
        return {
          ok: true,
          event: data.event,
          expGained: data.expGained,
          moneyGained: data.moneyGained,
        };
      }
      return { ok: false };
    },
    [player, initData]
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
