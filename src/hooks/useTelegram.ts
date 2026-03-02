"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app";

function bindSafeAreaToCss() {
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
  if (!tg) return;
  const root = document.documentElement;
  const safe = (
    tg as { safeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number } }
  ).safeAreaInset;
  const contentSafe = (
    tg as {
      contentSafeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
    }
  ).contentSafeAreaInset;
  if (safe) {
    root.style.setProperty("--tg-safe-area-inset-top", `${safe.top ?? 0}px`);
    root.style.setProperty("--tg-safe-area-inset-bottom", `${safe.bottom ?? 0}px`);
    root.style.setProperty("--tg-safe-area-inset-left", `${safe.left ?? 0}px`);
    root.style.setProperty("--tg-safe-area-inset-right", `${safe.right ?? 0}px`);
  }
  if (contentSafe) {
    root.style.setProperty("--tg-content-safe-area-inset-top", `${contentSafe.top ?? 0}px`);
    root.style.setProperty("--tg-content-safe-area-inset-bottom", `${contentSafe.bottom ?? 0}px`);
    root.style.setProperty("--tg-content-safe-area-inset-left", `${contentSafe.left ?? 0}px`);
    root.style.setProperty("--tg-content-safe-area-inset-right", `${contentSafe.right ?? 0}px`);
  }
}

export function useTelegram() {
  const { initData, telegramReady, actions } = useAppStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = window.Telegram;
    if (tg?.WebApp && !telegramReady) {
      tg.WebApp.ready();
      tg.WebApp.expand();
      bindSafeAreaToCss();
      const onSafeAreaChanged = () => bindSafeAreaToCss();
      (tg.WebApp as { onEvent?: (e: string, h: () => void) => void }).onEvent?.(
        "safeAreaChanged",
        onSafeAreaChanged
      );
      (tg.WebApp as { onEvent?: (e: string, h: () => void) => void }).onEvent?.(
        "contentSafeAreaChanged",
        onSafeAreaChanged
      );
      const data = tg.WebApp.initData || "";
      actions.setInitData(data);
      actions.setTelegramReady(true);
    }
  }, [telegramReady, actions]);

  const webApp =
    typeof window !== "undefined" && window.Telegram?.WebApp ? window.Telegram.WebApp : null;

  return { webApp, initData };
}
