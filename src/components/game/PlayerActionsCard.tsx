"use client";

import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

interface PlayerActionsCardProps {
  canAct: boolean;
  canRest: boolean;
  restCooldownLeftMin: number;
  actionLoading: string | null;
  onLearn: () => void;
  onRest: () => void;
}

export function PlayerActionsCard({
  canAct,
  canRest,
  restCooldownLeftMin,
  actionLoading,
  onLearn,
  onRest,
}: PlayerActionsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="pixel-font text-sm">Действия</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex w-full flex-col gap-3 sm:grid sm:grid-cols-3">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          disabled={!canAct || actionLoading !== null}
          onClick={onLearn}
        >
          {actionLoading === "learn" ? "..." : `📚 Учиться · ${ENERGY_PER_ACTION} ⚡`}
        </Button>
        <Link href="/tasks" className="w-full">
          <Button
            variant="success"
            size="sm"
            className="w-full"
            disabled={!!actionLoading}
          >
            📋 Задания · 1 ⚡
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!!actionLoading || !canRest}
          onClick={onRest}
          title={
            !canRest && restCooldownLeftMin > 0
              ? `Отдых через ${restCooldownLeftMin} мин`
              : undefined
          }
        >
          {actionLoading === "rest"
            ? "..."
            : !canRest && restCooldownLeftMin > 0
              ? `🛌 Отдых (${restCooldownLeftMin} мин) · 0 ⚡`
              : "🛌 Отдых · 0 ⚡"}
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
