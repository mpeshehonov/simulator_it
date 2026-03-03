"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";

export default function FixBugsPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, doAction } = usePlayer({ initData });
  const [minigameScore, setMinigameScore] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && initData && !player) {
      router.replace("/");
    }
  }, [isLoading, initData, player, router]);

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

  const handleComplete = async () => {
    if (!player || actionLoading) return;
    setActionLoading(true);
    try {
      const result = await doAction("fix_bugs", { score: minigameScore });
      if (result?.ok) {
        setMinigameScore(0);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const canAct = player && player.energy >= 1;

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-sm text-muted-foreground">Откройте приложение из Telegram.</p>
        <Link href="/">
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !player) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto max-w-md space-y-6">
        <header className="py-4 text-center">
          <h1 className="pixel-font text-xl text-primary">Фикс багов</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Мини-игра «скобка vs баги» — скоро здесь. Пока можно отправить тестовые очки.
          </p>
        </header>

        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Заглушка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs">
              Очки:{" "}
              <input
                type="number"
                min={0}
                max={999}
                value={minigameScore}
                onChange={(e) => setMinigameScore(Number(e.target.value) || 0)}
                className="w-20 rounded border bg-background px-2 py-1.5 text-sm"
              />
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={!canAct || actionLoading}
                onClick={handleComplete}
              >
                {actionLoading ? "..." : "Завершить и получить награду"}
              </Button>
              <Link href="/tasks">
                <Button variant="secondary" size="sm">
                  К заданиям
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
