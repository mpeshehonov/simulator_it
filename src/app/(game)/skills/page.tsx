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
      <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{branch.name}</p>
          <p className="text-xs text-muted-foreground">
            Уровень {currentLevel} / {branch.maxLevel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isMax && (
            <span className="text-[10px] text-muted-foreground">{SKILL_UPGRADE_EXP_COST} EXP</span>
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
      </CardContent>
    </Card>
  );
}

export default function SkillsPage() {
  const router = useRouter();
  const { initData } = useTelegram();
  const { player, isLoading, upgradeSkill } = usePlayer({ initData });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && initData && !player) {
      router.replace("/");
    }
  }, [isLoading, initData, player, router]);

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
        <p className="text-center text-muted-foreground">Откройте приложение из Telegram.</p>
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
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between py-4">
          <Link href="/">
            <Button variant="secondary" size="sm">
              ← Назад
            </Button>
          </Link>
          <h1 className="pixel-font text-lg text-primary">Навыки</h1>
          <div className="w-16" />
        </header>

        <Card>
          <CardContent className="flex flex-row items-center justify-between gap-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">Опыт для прокачки</p>
              <p className="font-medium">
                <AnimatedNumber value={player.exp} suffix=" EXP" countDuration={0} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{PROFESSION_NAMES[profession]}</p>
              <p className="text-lg">{PROFESSION_ICONS[profession]}</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Ветки навыков</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Каждый уровень навыка: {SKILL_UPGRADE_EXP_COST} EXP. Ветки усиливают доход и шанс успеха
            на собеседовании.
          </p>
          <div className="space-y-3">
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

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
