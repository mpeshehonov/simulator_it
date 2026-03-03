"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { FixBugsGame } from "@/components/game/FixBugsGame";

export default function FixBugsPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, doAction } = usePlayer({ initData });
  const [actionLoading, setActionLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

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

  const handleGameComplete = async (score: number) => {
    if (!player || actionLoading) return;
    setActionLoading(true);
    try {
      const result = await doAction("fix_bugs", { score });
      if (result?.ok) {
        setGameCompleted(true);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const canAct = player && player.energy >= 1;

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center pixel-font text-sm text-muted-foreground">
          Откройте приложение из Telegram.
        </p>
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
      <div className="mx-auto max-w-md space-y-8">
        <header className="py-4 text-center">
          <h1 className="pixel-font text-xl text-primary">Фикс багов</h1>
          <p className="mt-1 pixel-font text-xs text-muted-foreground">
            Мини-игра: скобка {'}'} против багов 🐛. Уничтожь всех и получи награду по очкам.
          </p>
        </header>

        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Скобка vs баги</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gameCompleted ? (
              <div className="space-y-3">
                <p className="pixel-font text-sm text-muted-foreground">
                  Награда начислена. Можешь сыграть ещё раз (тратится энергия) или вернуться к
                  заданиям.
                </p>
                <div className="flex gap-2">
                  <Link href="/tasks" className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      К заданиям
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setGameCompleted(false)}
                    className="pixel-font rounded border border-border px-3 py-2 text-sm"
                  >
                    Ещё раз
                  </button>
                </div>
              </div>
            ) : (
              <>
                <FixBugsGame
                  key={gameCompleted ? "done" : "play"}
                  onComplete={handleGameComplete}
                  disabled={!canAct || actionLoading}
                />
                {actionLoading && (
                  <p className="pixel-font text-center text-xs text-muted-foreground">
                    Начисляем награду…
                  </p>
                )}
                <Link href="/tasks" className="block">
                  <Button variant="secondary" size="sm" className="w-full">
                    ← К заданиям
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
