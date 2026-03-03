"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import { EXP_FOR_INTERVIEW, REST_COOLDOWN_MINUTES } from "@/lib/game/constants";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { PlayerProfileCard } from "@/components/game/PlayerProfileCard";
import { PlayerActionsCard } from "@/components/game/PlayerActionsCard";
import { useAppStore } from "@/store/app";

const MOCK_PLAYER = {
  profession: "frontend" as const,
  level: 2,
  exp: 87,
  money: 1250,
  reputation: 12,
  energy: 7,
  skills: {} as Record<string, number>,
};

export function GamePageClient() {
  const router = useRouter();
  const { initData } = useTelegram();
  const { player, isLoading, error, needsOnboarding, doAction } = usePlayer({
    initData,
  });

  useEffect(() => {
    if (!isLoading && initData && needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [isLoading, initData, needsOnboarding, router]);

  useEffect(
    () => () => {
      if (deltasTimeoutRef.current) clearTimeout(deltasTimeoutRef.current);
    },
    []
  );

  const [lastEvent, setLastEvent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastDeltas, setLastDeltas] = useState<{
    exp?: number;
    money?: number;
    energy?: number;
  }>({});
  const deltasTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = player ?? (initData ? null : MOCK_PLAYER);

  const handleAction = async (actionId: string, payload?: unknown) => {
    if (!player || actionLoading) return;
    setActionLoading(actionId);
    try {
      const result = await doAction(actionId, payload);
      if (result?.ok && result.event) {
        setLastEvent({
          title: result.event.title,
          description: result.event.description,
        });
        const newPlayer = useAppStore.getState().player;
        const energyDelta = newPlayer ? newPlayer.energy - player.energy : 0;
        if (deltasTimeoutRef.current) clearTimeout(deltasTimeoutRef.current);
        setLastDeltas({
          exp: result.expGained ?? 0,
          money: result.moneyGained ?? 0,
          energy: energyDelta !== 0 ? energyDelta : undefined,
        });
        deltasTimeoutRef.current = setTimeout(() => setLastDeltas({}), 1200);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const canAct = player && player.energy >= 1;

  const restCooldownMs = REST_COOLDOWN_MINUTES * 60 * 1000;
  const lastRestAt = player?.lastRestAt ? new Date(player.lastRestAt).getTime() : 0;
  const restElapsed = Date.now() - lastRestAt;
  const canRest = restElapsed >= restCooldownMs;
  const restCooldownLeftMin =
    !canRest && lastRestAt ? Math.ceil((restCooldownMs - restElapsed) / 60000) : 0;

  const [, setRestTick] = useState(0);
  useEffect(() => {
    if (!player?.lastRestAt || canRest) return;
    const id = setInterval(() => setRestTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [player?.lastRestAt, canRest]);

  const expForInterview = data ? (EXP_FOR_INTERVIEW[data.level] ?? 0) : 0;
  const canGoToInterview = data != null && data.exp >= expForInterview;

  const displayLastEvent = lastEvent ?? player?.lastEvent ?? null;

  if (initData && isLoading && !needsOnboarding && !player) {
    return <LoadingScreen />;
  }

  if (initData && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="pixel-font text-destructive">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Обновить
        </Button>
      </div>
    );
  }

  if (initData && !player && !needsOnboarding) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center pixel-font text-muted-foreground">
          Не удалось загрузить профиль. Откройте приложение из Telegram.
        </p>
      </div>
    );
  }

  return (
    <div className="app-safe-top min-h-screen bg-background p-4 pb-8">
      <div className="mx-auto max-w-md space-y-8">
        <header className="py-4 text-center">
          <h1 className="pixel-font text-xl text-primary">Симулятор айтишника</h1>
        </header>

        {data && (
          <>
            <PlayerProfileCard data={data} lastDeltas={lastDeltas} />
            {player && (
              <PlayerActionsCard
                canAct={!!canAct}
                canRest={canRest}
                restCooldownLeftMin={restCooldownLeftMin}
                actionLoading={actionLoading}
                onLearn={() => handleAction("learn")}
                onRest={() => handleAction("rest")}
              />
            )}
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="pixel-font text-sm">Последнее событие</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {displayLastEvent ? (
              <>
                <p className="pixel-font text-sm font-medium text-foreground leading-relaxed">
                  {displayLastEvent.title}
                </p>
                <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                  {displayLastEvent.description}
                </p>
              </>
            ) : (
              <p className="pixel-font text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        {data && expForInterview > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="pixel-font text-sm">Путь к собеседованию</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
                EXP: {data.exp} / {expForInterview}
              </p>
              <div className="h-2 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((data.exp / expForInterview) * 100))}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <nav className="grid gap-4">
          <Link href="/how-to-play">
            <Button variant="secondary" className="w-full">
              ❓ Как играть
            </Button>
          </Link>
          <Link href="/skills">
            <Button variant="secondary" className="w-full">
              📊 Навыки
            </Button>
          </Link>
          <Link href="/interview">
            <Button
              variant="default"
              className="w-full"
              disabled={!canGoToInterview}
              title={
                !canGoToInterview && data
                  ? `Нужно ${expForInterview} EXP для собеседования (сейчас ${data.exp})`
                  : undefined
              }
            >
              🎯 Собеседование
            </Button>
          </Link>
          <Link href="/profession">
            <Button variant="secondary" className="w-full">
              👤 Сменить профессию
            </Button>
          </Link>
        </nav>

        {!initData && (
          <p className="text-center pixel-font text-[10px] text-muted-foreground">
            Режим превью (откройте в Telegram для полного функционала)
          </p>
        )}
      </div>
    </div>
  );
}
