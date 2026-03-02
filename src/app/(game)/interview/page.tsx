"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";

export default function InterviewPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();

  useEffect(() => {
    const back = webApp?.BackButton;
    if (!back) return;
    back.show();
    const handler = () => router.back();
    back.onClick(handler);
    return () => {
      back.offClick(handler);
      back.hide();
    };
  }, [webApp, router]);

  return (
    <div className="app-safe-top flex min-h-screen flex-col px-4 pb-8">
      <header className="flex items-center justify-between py-4">
        {!initData ? (
          <Link href="/">
            <Button variant="secondary" size="sm">
              ← Назад
            </Button>
          </Link>
        ) : (
          <div />
        )}
        <h1 className="pixel-font text-lg text-primary">Собеседование</h1>
        <div className="w-16" />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <p className="pixel-font text-xs text-muted-foreground">Раздел в разработке</p>
      </div>
    </div>
  );
}
