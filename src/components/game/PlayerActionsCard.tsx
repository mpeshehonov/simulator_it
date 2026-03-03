"use client";

import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui/pixelact-ui";

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
      <CardContent className="flex flex-col gap-2 pt-4">
        <p className="w-full text-center pixel-font text-[10px] text-muted-foreground">
          Действия
        </p>
        <div className="flex w-full flex-col gap-2 sm:grid sm:grid-cols-3">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          disabled={!canAct || actionLoading !== null}
          onClick={onLearn}
        >
          {actionLoading === "learn" ? "..." : "📚 Учиться"}
        </Button>
        <Link href="/tasks" className="w-full">
          <Button
            variant="success"
            size="sm"
            className="w-full"
            disabled={!!actionLoading}
          >
            📋 Задания
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
              ? `🛌 Отдых (${restCooldownLeftMin} мин)`
              : "🛌 Отдых"}
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
