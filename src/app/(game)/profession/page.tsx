"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import {
  PROFESSIONS,
  PROFESSION_NAMES,
  PROFESSION_DESCRIPTIONS,
  PROFESSION_ICONS,
  type ProfessionId,
} from "@/lib/game/professions";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";

export default function ProfessionPage() {
  const router = useRouter();
  const { initData } = useTelegram();
  const { player, isLoading, updateProfession } = usePlayer({ initData });
  const [selected, setSelected] = useState<ProfessionId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && initData && !player) {
      router.replace("/");
    }
  }, [isLoading, initData, player, router]);

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-muted-foreground">
          Откройте приложение из Telegram, чтобы менять профессию.
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

  const handleSave = async () => {
    if (!selected || submitting) return;
    if (selected === player.profession) {
      router.push("/");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ok = await updateProfession(selected);
      if (ok) {
        router.push("/");
      } else {
        setError("Не удалось сменить профессию. Попробуй снова.");
      }
    } catch {
      setError("Ошибка. Попробуй снова.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentProfession = player.profession as ProfessionId;

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between py-4">
          <Link href="/">
            <Button variant="secondary" size="sm">
              ← Назад
            </Button>
          </Link>
          <h1 className="pixel-font text-lg text-primary">Сменить профессию</h1>
          <div className="w-16" />
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выбери профессию</CardTitle>
            <p className="text-xs text-muted-foreground">
              Смена профессии сбросит все навыки до нуля
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROFESSIONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={`flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  selected === id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className="text-2xl">{PROFESSION_ICONS[id]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{PROFESSION_NAMES[id]}</p>
                    {id === currentProfession && (
                      <span className="text-[10px] text-muted-foreground">(текущая)</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {PROFESSION_DESCRIPTIONS[id]}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full" disabled={submitting}>
              Отмена
            </Button>
          </Link>
          <Button
            variant="default"
            className="flex-1"
            disabled={!selected || submitting || selected === currentProfession}
            onClick={handleSave}
          >
            {submitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
