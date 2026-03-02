"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<Window["Telegram"] | null>(null);
  const [initData, setInitData] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = window.Telegram;
    if (tg?.WebApp) {
      tg.WebApp.ready();
      tg.WebApp.expand();
      setWebApp(tg);
      setInitData(tg.WebApp.initData || "");
    }
  }, []);

  return { webApp: webApp?.WebApp ?? null, initData };
}
