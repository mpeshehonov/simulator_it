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
import { INCOME_SKILL_MULTIPLIER, INTERVIEW_SKILL_BONUS } from "@/lib/game/skills";
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
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {Icon ? <Icon className="h-5 w-5" strokeWidth={2} /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight text-foreground">
              {branch.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Уровень {currentLevel} из {branch.maxLevel}
            </p>
          </div>
        </div>
        {branch.description && (
          <p className="text-xs leading-snug text-muted-foreground">
            {branch.description}
          </p>
        )}
        <p className="text-[10px] leading-snug text-primary">
          За уровень: +{Math.round(INCOME_SKILL_MULTIPLIER * 100)}% к доходу, +
          {Math.round(INTERVIEW_SKILL_BONUS * 100)}% к шансу собеседования
        </p>
        <Button
          variant={isMax ? "secondary" : "default"}
          size="sm"
          className="w-full"
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
          {loading ? "..." : isMax ? "Макс" : `+1 уровень · ${SKILL_UPGRADE_EXP_COST} EXP`}
        </Button>
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
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
  const totalSkillLevels = Object.values(skills).reduce((a, b) => a + b, 0);
  const incomeBonusPercent = Math.round(totalSkillLevels * INCOME_SKILL_MULTIPLIER * 100);
  const interviewBonusPercent = Math.round(totalSkillLevels * INTERVIEW_SKILL_BONUS * 100);

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto flex max-w-md flex-col gap-5">
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

        <Card className="border-primary/30">
          <CardContent className="space-y-2 py-4">
            <p className="pixel-font text-[10px] font-medium text-primary uppercase tracking-wide">
              Твои бонусы от навыков
            </p>
            <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
              Сумма уровней по всем веткам: <strong className="text-foreground">{totalSkillLevels}</strong>
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="rounded bg-primary/10 px-2 py-1 pixel-font text-[10px] text-primary">
                Доход с задач: +{incomeBonusPercent}%
              </span>
              <span className="rounded bg-primary/10 px-2 py-1 pixel-font text-[10px] text-primary">
                Шанс собеседования: +{interviewBonusPercent}%
              </span>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 pixel-font text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Ветки навыков
          </h2>
          <div className="flex flex-col gap-5">
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
              Один уровень = {SKILL_UPGRADE_EXP_COST} EXP. Каждый уровень даёт +5% к доходу с задач и
              +2% к шансу пройти собеседование (суммируются по всем веткам). При смене профессии
              ветки навыков обнуляются.
            </p>
          </CardContent>
        </Card>

        {error && <p className="text-center pixel-font text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
