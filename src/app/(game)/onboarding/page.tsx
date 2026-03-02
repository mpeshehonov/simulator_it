"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function OnboardingPage() {
  const router = useRouter();
  const { initData } = useTelegram();
  const { player, isLoading, completeOnboarding } = usePlayer({
    initData,
  });
  const [selected, setSelected] = useState<ProfessionId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Уже есть игрок — на главную
  useEffect(() => {
    if (!isLoading && player) {
      router.replace("/");
    }
  }, [player, isLoading, router]);

  // Нет initData — не из Telegram
  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-muted-foreground">
          Откройте приложение из Telegram, чтобы начать игру.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Игрок есть — редирект обрабатывается в useEffect
  if (player) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Переход в игру...</p>
      </div>
    );
  }

  // needsOnboarding или попали напрямую — показываем выбор
  const handleStart = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const ok = await completeOnboarding(selected);
      if (ok) {
        router.replace("/");
      } else {
        setError("Не удалось создать профиль. Попробуй снова.");
      }
    } catch {
      setError("Ошибка. Попробуй снова.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="mx-auto max-w-md space-y-8">
        <header className="py-8 text-center">
          <h1 className="pixel-font text-xl text-primary">Симулятор айтишника</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Добро пожаловать! Выбери профессию и начни карьеру в IT.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выбери профессию</CardTitle>
            <p className="text-xs text-muted-foreground">
              От профессии зависят события и ветки навыков
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
                <div>
                  <p className="font-medium">{PROFESSION_NAMES[id]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {PROFESSION_DESCRIPTIONS[id]}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button
          variant="success"
          size="lg"
          className="w-full"
          disabled={!selected || submitting}
          onClick={handleStart}
        >
          {submitting ? "Создаём профиль..." : "Начать игру"}
        </Button>
      </div>
    </div>
  );
}
