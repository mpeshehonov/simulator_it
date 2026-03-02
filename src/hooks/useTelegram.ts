"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app";

export function useTelegram() {
  const { initData, telegramReady, actions } = useAppStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = window.Telegram;
    if (tg?.WebApp && !telegramReady) {
      tg.WebApp.ready();
      tg.WebApp.expand();
      const data = tg.WebApp.initData || "";
      actions.setInitData(data);
      actions.setTelegramReady(true);
    }
  }, [telegramReady, actions]);

  const webApp =
    typeof window !== "undefined" && window.Telegram?.WebApp ? window.Telegram.WebApp : null;

  return { webApp, initData };
}
