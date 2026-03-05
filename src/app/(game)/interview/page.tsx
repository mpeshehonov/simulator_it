"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";

interface InterviewQuestionDto {
  id: string;
  text: string;
  hint?: string;
}

interface InterviewMeta {
  chance: number;
  requiredSkillLevels: number;
  currentSkillLevels: number;
  questions: InterviewQuestionDto[];
}

type InterviewState = "idle" | "loading" | "ready" | "cooldown" | "not_enough_skills" | "max_level";

export default function InterviewPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, refresh } = usePlayer({ initData });

  const [state, setState] = useState<InterviewState>("idle");
  const [meta, setMeta] = useState<InterviewMeta | null>(null);
  const [cooldownLeftMs, setCooldownLeftMs] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; chance: number } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  /** После успешного POST не перезапрашивать GET: refresh() обновит player, эффект бы переключил на кулдаун и скрыл результат */
  const submittedRef = useRef(false);

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

  useEffect(() => {
    if (!initData || isLoading) return;
    if (!player) return;
    if (submittedRef.current) return;

    let cancelled = false;
    async function load() {
      setState("loading");
      setErrorText(null);
      try {
        const res = await fetch("/api/interview", {
          headers: {
            "X-Telegram-Init-Data": initData,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok || !data.ok) {
          if (data.error === "not_enough_skills") {
            setState("not_enough_skills");
            setMeta({
              chance: 0,
              requiredSkillLevels: data.requiredSkillLevels ?? 0,
              currentSkillLevels: data.currentSkillLevels ?? 0,
              questions: [],
            });
          } else if (data.error === "cooldown") {
            setState("cooldown");
            setCooldownLeftMs(data.cooldownLeftMs ?? 0);
          } else if (data.error === "max_level") {
            setState("max_level");
          } else {
            setState("idle");
          }
          return;
        }

        setMeta({
          chance: data.chance ?? 0,
          requiredSkillLevels: data.requiredSkillLevels ?? 0,
          currentSkillLevels: data.currentSkillLevels ?? 0,
          questions: data.questions ?? [],
        });
        setState("ready");
      } catch {
        if (!cancelled) setState("idle");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [initData, isLoading, player]);

  const handleSubmit = async () => {
    if (!initData || submitLoading) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData,
        },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const code = data.error as string | undefined;

        if (code === "cooldown") {
          setState("cooldown");
          setCooldownLeftMs(data.cooldownLeftMs ?? 0);
        } else if (code === "not_enough_skills") {
          setState("not_enough_skills");
          setMeta({
            chance: 0,
            requiredSkillLevels: data.requiredSkillLevels ?? meta?.requiredSkillLevels ?? 0,
            currentSkillLevels: data.currentSkillLevels ?? meta?.currentSkillLevels ?? 0,
            questions: [],
          });
        } else if (code === "max_level") {
          setState("max_level");
        } else {
          setErrorText(
            "Не удалось сохранить результат собеседования. Попробуй ещё раз чуть позже."
          );
        }

        return;
      }

      setResult({ success: !!data.success, chance: data.chance ?? 0 });
      setErrorText(null);
      submittedRef.current = true;
      await refresh();
    } catch {
      setErrorText("Не удалось пройти собеседование. Проверь соединение и попробуй снова.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
        <p className="text-center pixel-font text-sm text-muted-foreground">
          Откройте приложение из Telegram.
        </p>
        <Link href="/">
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !player || state === "loading") {
    return <LoadingScreen />;
  }

  const chancePercent = meta ? Math.round(meta.chance * 100) : null;
  const formatCooldown = (ms: number) => {
    const totalMin = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMin / 60);
    const minutes = totalMin % 60;
    if (hours <= 0) return `${minutes} мин`;
    return `${hours} ч ${minutes} мин`;
  };

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex items-center justify-between py-4">
          {!initData ? (
            <Link href="/">
              <Button variant="secondary" size="sm">
                ← Назад
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <h1 className="pixel-font text-lg text-primary">Собеседование</h1>
          <div className="w-16" />
        </header>

        {state === "not_enough_skills" && meta && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="pixel-font text-sm">Пока рано</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                Для следующего уровня нужно {meta.requiredSkillLevels} уровней навыков (сумма по всем
                веткам), сейчас у тебя {meta.currentSkillLevels}. Прокачивай навыки за EXP на
                странице «Навыки».
              </p>
              <Link href="/skills" className="block w-full">
                <Button variant="default" size="sm" className="w-full">
                  К навыкам
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {state === "cooldown" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="pixel-font text-sm">Кулдаун собеседования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                Ты недавно уже проходил собеседование. Попробуй снова через{" "}
                {formatCooldown(cooldownLeftMs)}.
              </p>
              <Link href="/" className="block w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  На главную
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {state === "max_level" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="pixel-font text-sm">Максимальный уровень</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                Ты уже Лид. Дальнейшее развитие — за пределами MVP :)
              </p>
              <Link href="/" className="block w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  На главную
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {state === "ready" && meta && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="pixel-font text-sm">Попытка собеседования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                  Шанс успеха (плюс‑минус): {chancePercent ?? 0}%
                </p>
                <p className="pixel-font text-[10px] text-muted-foreground">
                  Уровни навыков: {meta.currentSkillLevels} / {meta.requiredSkillLevels}
                </p>
              </div>
              <div className="space-y-2">
                <p className="pixel-font text-[10px] font-medium text-muted-foreground">
                  Примеры вопросов:
                </p>
                <ul className="space-y-2">
                  {meta.questions.map((q) => (
                    <li key={q.id} className="space-y-1">
                      <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
                        • {q.text}
                      </p>
                      {q.hint && (
                        <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
                          Подсказка: {q.hint}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                disabled={submitLoading}
                onClick={handleSubmit}
              >
                {submitLoading ? "..." : "Пройти собеседование"}
              </Button>

              {result && (
                <p className="pixel-font text-xs text-muted-foreground leading-relaxed">
                  {result.success
                    ? "Удача! Твой уровень мог повыситься — посмотри на главном экране."
                    : "Не повезло. Репутация немного просела, попробуй позже ещё раз."}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {errorText && (
          <p className="pixel-font text-xs text-destructive leading-relaxed">
            {errorText}
          </p>
        )}
      </div>
    </div>
  );
}
