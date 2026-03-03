"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { PlayerProfileCard } from "@/components/game/PlayerProfileCard";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

export default function TasksPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, doAction } = usePlayer({ initData });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleTask = async () => {
    if (!player || actionLoading) return;
    setActionLoading("task");
    try {
      await doAction("task");
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

        <PlayerProfileCard data={player} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Рабочая задача</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
              Взять задачу: EXP и деньги за одну энергию.
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
              {actionLoading === "task" ? "..." : `Взять задачу · ${ENERGY_PER_ACTION} ⚡`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Подписка на каналы</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
              Подпишитесь на партнёрские каналы и получайте EXP за каждый канал.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/channels">
              <Button variant="secondary" size="sm" className="w-full">
                Перейти к каналам · бесплатно
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Фикс багов</CardTitle>
            <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
              Мини-игра: скобка против багов, награда по очкам.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/fix-bugs">
              <Button variant="secondary" size="sm" className="w-full">
                Играть · {ENERGY_PER_ACTION} ⚡
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
