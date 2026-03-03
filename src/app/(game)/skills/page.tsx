"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui/pixelact-ui";
import {
  PROFESSION_SKILL_BRANCHES,
  PROFESSION_NAMES,
  PROFESSION_ICONS,
} from "@/lib/game/professions";
import { SKILL_UPGRADE_EXP_COST } from "@/lib/game/constants";
import { SKILL_BRANCH_ICONS } from "@/lib/game/skill-icons";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { AnimatedNumber } from "@/components/game/AnimatedNumber";
import type { SkillBranch } from "@/types/game";

interface SkillCardProps {
  branch: SkillBranch;
  currentLevel: number;
  playerExp: number;
  onUpgrade: (branchId: string) => Promise<{ ok: boolean; error?: string }>;
}

function SkillCard({ branch, currentLevel, playerExp, onUpgrade }: SkillCardProps) {
  const [loading, setLoading] = useState(false);
  const canUpgrade = currentLevel < branch.maxLevel && playerExp >= SKILL_UPGRADE_EXP_COST;
  const isMax = currentLevel >= branch.maxLevel;
  const Icon = SKILL_BRANCH_ICONS[branch.id];

  const handleUpgrade = async () => {
    if (!canUpgrade || loading) return;
    setLoading(true);
    try {
      await onUpgrade(branch.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {Icon ? <Icon className="h-6 w-6" strokeWidth={2} /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight text-foreground wrap-break-word">
              {branch.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Уровень {currentLevel} из {branch.maxLevel}
            </p>
            {branch.description && (
              <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                {branch.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end justify-center gap-1">
            {!isMax && (
              <span className="text-[10px] text-muted-foreground">
                {SKILL_UPGRADE_EXP_COST} EXP
              </span>
            )}
            <Button
              variant={isMax ? "secondary" : "default"}
              size="sm"
              disabled={!canUpgrade || loading}
              onClick={handleUpgrade}
              title={
                isMax
                  ? "Максимальный уровень"
                  : !canUpgrade
                    ? `Нужно ${SKILL_UPGRADE_EXP_COST} EXP`
                    : undefined
              }
            >
              {loading ? "..." : isMax ? "Макс" : "+1"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SkillsPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, upgradeSkill } = usePlayer({ initData });
  const [error, setError] = useState<string | null>(null);

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

  const handleUpgrade = async (branchId: string) => {
    setError(null);
    const result = await upgradeSkill(branchId);
    if (!result.ok) {
      setError(result.error ?? "Ошибка прокачки");
    }
    return result;
  };

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center pixel-font text-xs text-muted-foreground">
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

  const profession = player.profession as keyof typeof PROFESSION_SKILL_BRANCHES;
  const branches = PROFESSION_SKILL_BRANCHES[profession] ?? [];
  const skills = player.skills ?? {};

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto max-w-md space-y-8">
        <header className="grid grid-cols-3 items-center py-5">
          {!initData ? (
            <Link href="/">
              <Button variant="secondary" size="sm">
                ← Назад
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <h1 className="pixel-font text-center text-lg text-primary">Навыки</h1>
          <div />
        </header>

        <Card>
          <CardContent className="flex flex-row items-center justify-between gap-4 py-4">
            <div>
              <p className="pixel-font text-[10px] text-muted-foreground">Опыт для прокачки</p>
              <p className="pixel-font text-sm font-medium">
                <AnimatedNumber value={player.exp} suffix=" EXP" countDuration={0} />
              </p>
            </div>
            <div className="text-right">
              <p className="pixel-font text-[10px] text-muted-foreground">
                {PROFESSION_NAMES[profession]}
              </p>
              <p className="text-lg">{PROFESSION_ICONS[profession]}</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 pixel-font text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Ветки навыков
          </h2>
          <div className="space-y-4">
            {branches.map((branch) => (
              <SkillCard
                key={branch.id}
                branch={branch}
                currentLevel={skills[branch.id] ?? 0}
                playerExp={player.exp}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-3 py-4">
            <p className="pixel-font text-[10px] font-medium text-muted-foreground">
              Как работают навыки
            </p>
            <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
              Один уровень = {SKILL_UPGRADE_EXP_COST} EXP. Чем выше сумма уровней по всем веткам —
              тем больше доход с задач и шанс пройти собеседование. При смене профессии ветки
              навыков обнуляются под новую профессию.
            </p>
          </CardContent>
        </Card>

        {error && <p className="text-center pixel-font text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
