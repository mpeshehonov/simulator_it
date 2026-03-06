"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";

interface InterviewOptionDto {
  id: string;
  text: string;
}

interface InterviewQuestionDto {
  id: string;
  text: string;
  options: InterviewOptionDto[];
}

interface InterviewMeta {
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
  const [result, setResult] = useState<{
    success: boolean;
    correctCount: number;
    total: number;
  } | null>(null);
  /** Выбранный вариант по questionId */
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
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
          requiredSkillLevels: data.requiredSkillLevels ?? 0,
          currentSkillLevels: data.currentSkillLevels ?? 0,
          questions: data.questions ?? [],
        });
        setSelectedAnswers({});
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

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const allAnswered =
    meta?.questions.length &&
    meta.questions.every((q) => selectedAnswers[q.id] != null && selectedAnswers[q.id] !== "");

  const handleSubmit = async () => {
    if (!initData || submitLoading || !meta || !allAnswered) return;
    setSubmitLoading(true);
    try {
      const answers = meta.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id],
      }));
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData,
        },
        body: JSON.stringify({ answers }),
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
            requiredSkillLevels: data.requiredSkillLevels ?? meta?.requiredSkillLevels ?? 0,
            currentSkillLevels: data.currentSkillLevels ?? meta?.currentSkillLevels ?? 0,
            questions: [],
          });
        } else if (code === "max_level") {
          setState("max_level");
        } else {
          setErrorText(
            data.message ?? "Не удалось сохранить результат собеседования. Попробуй ещё раз чуть позже."
          );
        }

        return;
      }

      setResult({
        success: !!data.success,
        correctCount: data.correctCount ?? 0,
        total: data.total ?? 0,
      });
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
              <CardTitle className="pixel-font text-sm">Собеседование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="pixel-font text-[10px] text-muted-foreground">
                Уровни навыков: {meta.currentSkillLevels} / {meta.requiredSkillLevels}. Ответь на
                вопросы — для прохождения нужна минимум 60% правильных ответов.
              </p>
              <div className="space-y-4">
                {meta.questions.map((q, index) => (
                  <div key={q.id} className="space-y-2">
                    <p className="pixel-font text-xs font-medium text-foreground">
                      {index + 1}. {q.text}
                    </p>
                    <div className="grid gap-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2 has-checked:border-primary has-checked:bg-primary/10"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.id}
                            checked={selectedAnswers[q.id] === opt.id}
                            onChange={() => handleSelect(q.id, opt.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          <span className="pixel-font text-[10px] text-foreground">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                disabled={submitLoading || !allAnswered}
                onClick={handleSubmit}
              >
                {submitLoading ? "Отправка…" : "Отправить ответы"}
              </Button>

              {result && (
                <div className="space-y-1 rounded border border-border bg-muted/30 p-3">
                  <p className="pixel-font text-xs font-medium text-foreground">
                    {result.success ? "Собеседование пройдено." : "Собеседование не пройдено."}
                  </p>
                  <p className="pixel-font text-[10px] text-muted-foreground">
                    Правильных ответов: {result.correctCount} из {result.total}.
                  </p>
                  <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
                    {result.success
                      ? "Уровень мог повыситься — посмотри на главном экране."
                      : "Репутация немного просела. Можно попробовать снова после кулдауна."}
                  </p>
                </div>
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
