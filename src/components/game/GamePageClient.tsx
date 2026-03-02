"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
} from "@/components/ui/pixelact-ui";
import {
  CAREER_LEVELS,
  MAX_ENERGY,
  EXP_FOR_INTERVIEW,
  REST_COOLDOWN_MINUTES,
} from "@/lib/game/constants";
import { PROFESSION_NAMES } from "@/lib/game/professions";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { AnimatedNumber } from "@/components/game/AnimatedNumber";
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
  const levelInfo = data ? CAREER_LEVELS[data.level] : null;
  const professionName = data
    ? PROFESSION_NAMES[data.profession as keyof typeof PROFESSION_NAMES]
    : "—";

  const handleAction = async (action: "learn" | "task" | "rest") => {
    if (!player || actionLoading) return;
    setActionLoading(action);
    try {
      const result = await doAction(action);
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
        <p className="text-destructive">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Обновить
        </Button>
      </div>
    );
  }

  if (initData && !player && !needsOnboarding) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-muted-foreground">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">{levelInfo?.name ?? "Безработный"}</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">{professionName}</p>
              </div>
              <Badge variant="default" className="text-[10px]">
                Lv.{data.level}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="font-medium">
                      <AnimatedNumber
                        value={data.energy}
                        suffix={`/${MAX_ENERGY}`}
                        delta={lastDeltas.energy}
                        countDuration={350}
                      />
                    </p>
                    <p className="text-[10px] text-muted-foreground">Энергия</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="font-medium">
                      <AnimatedNumber
                        value={data.money}
                        suffix="$"
                        delta={lastDeltas.money}
                        countDuration={350}
                      />
                    </p>
                    <p className="text-[10px] text-muted-foreground">Деньги</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
                  <span className="text-lg">📘</span>
                  <div>
                    <p className="font-medium">
                      <AnimatedNumber
                        value={data.exp}
                        suffix=" EXP"
                        delta={lastDeltas.exp}
                        countDuration={350}
                      />
                    </p>
                    <p className="text-[10px] text-muted-foreground">Опыт</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="font-medium">{data.reputation}</p>
                    <p className="text-[10px] text-muted-foreground">Репутация</p>
                  </div>
                </div>
              </div>
            </CardContent>

            {player && (
              <CardFooter className="flex flex-col gap-2">
                <p className="w-full text-center text-[10px] text-muted-foreground">Действия</p>
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    disabled={!canAct || actionLoading !== null}
                    onClick={() => handleAction("learn")}
                  >
                    {actionLoading === "learn" ? "..." : "📚 Учиться"}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full"
                    disabled={!canAct || actionLoading !== null}
                    onClick={() => handleAction("task")}
                  >
                    {actionLoading === "task" ? "..." : "💻 Задача"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={!!actionLoading || !canRest}
                    onClick={() => handleAction("rest")}
                    title={
                      !canRest && restCooldownLeftMin > 0
                        ? `Отдых через ${restCooldownLeftMin} мин`
                        : undefined
                    }
                  >
                    {actionLoading === "rest"
                      ? "..."
                      : !canRest && restCooldownLeftMin > 0
                        ? `🛌 Отдых (${restCooldownLeftMin} мин)`
                        : "🛌 Отдых"}
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Последнее событие</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {displayLastEvent
                ? `${displayLastEvent.title} — ${displayLastEvent.description}`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <nav className="grid gap-2">
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
          <p className="text-center text-[10px] text-muted-foreground">
            Режим превью (откройте в Telegram для полного функционала)
          </p>
        )}
      </div>
    </div>
  );
}
