"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { useAppStore } from "@/store/app";

export default function TasksPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, doAction } = usePlayer({ initData });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<{ title: string; description: string } | null>(null);
  const [lastDeltas, setLastDeltas] = useState<{
    exp?: number;
    money?: number;
    energy?: number;
  }>({});
  const deltasTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading && initData && !player) {
      router.replace("/");
    }
  }, [isLoading, initData, player, router]);

  useEffect(
    () => () => {
      if (deltasTimeoutRef.current) clearTimeout(deltasTimeoutRef.current);
    },
    []
  );

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

  const handleTask = async () => {
    if (!player || actionLoading) return;
    setActionLoading("task");
    try {
      const result = await doAction("task");
      if (result?.ok && result.event) {
        setLastEvent({ title: result.event.title, description: result.event.description });
        const newPlayer = useAppStore.getState().player;
        const energyDelta = newPlayer ? newPlayer.energy - player.energy : 0;
        setLastDeltas({
          exp: result.expGained ?? 0,
          money: result.moneyGained ?? 0,
          energy: energyDelta !== 0 ? energyDelta : undefined,
        });
        if (deltasTimeoutRef.current) clearTimeout(deltasTimeoutRef.current);
        deltasTimeoutRef.current = setTimeout(() => setLastDeltas({}), 1500);
      }
    } finally {
      setActionLoading(null);
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
          <h1 className="pixel-font text-xl text-primary">Задания</h1>
          <p className="mt-1 pixel-font text-xs text-muted-foreground">
            Рабочие задачи и доп. активности — всё в одном месте
          </p>
        </header>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Рабочая задача</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground">
              Взять задачу: EXP и деньги за одну энергию
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="success"
              size="sm"
              className="w-full"
              disabled={!canAct || !!actionLoading}
              onClick={handleTask}
            >
              {actionLoading === "task" ? "..." : "Взять задачу"}
            </Button>
          </CardContent>
        </Card>

        {lastEvent && (
          <Card className="border-primary/30">
            <CardHeader className="pb-1">
              <CardTitle className="pixel-font text-sm">Результат</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="pixel-font text-xs text-foreground">
                {lastEvent.title} — {lastEvent.description}
              </p>
              <div className="flex flex-wrap gap-3 pixel-font text-[10px]">
                {lastDeltas.exp != null && lastDeltas.exp !== 0 && (
                  <span className="text-green-600">+{lastDeltas.exp} EXP</span>
                )}
                {lastDeltas.money != null && lastDeltas.money !== 0 && (
                  <span className="text-green-600">+{lastDeltas.money} денег</span>
                )}
                {lastDeltas.energy != null && lastDeltas.energy !== 0 && (
                  <span className={lastDeltas.energy < 0 ? "text-destructive" : "text-green-600"}>
                    {lastDeltas.energy > 0 ? "+" : ""}
                    {lastDeltas.energy} энергия
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Подписка на каналы</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground">
              Подпишитесь на партнёрские каналы и получайте EXP за каждый
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/channels">
              <Button variant="secondary" size="sm" className="w-full">
                Перейти к каналам
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Фикс багов</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground">
              Мини-игра: скобка против багов, награда по очкам
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/fix-bugs">
              <Button variant="secondary" size="sm" className="w-full">
                Играть
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
