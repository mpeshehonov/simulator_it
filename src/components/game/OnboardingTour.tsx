"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/pixelact-ui";
import type { OnboardingTourStep } from "@/store/app";

const TOUR_MESSAGES: Record<Exclude<OnboardingTourStep, "done">, string> = {
  0: "Вот твои ресурсы: энергия, деньги, опыт, репутация. Трать энергию на действия — восстанавливается со временем.",
  1: "Действия: Учиться (+EXP), Задания (задачи и мини-игры за EXP и деньги), Отдых (восстановить энергию, раз в 20 мин).",
  2: "Ниже — ссылки на навыки и собеседование. Сначала копи EXP заданиями, прокачивай навыки, потом проходи собеседование для повышения уровня.",
  3: "Вот и всё! Удачи в карьере.",
};

interface OnboardingTourProps {
  step: Exclude<OnboardingTourStep, "done">;
  targetRef: React.RefObject<HTMLElement | null>;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ step, targetRef, onNext, onSkip }: OnboardingTourProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) {
      setRect(null);
      return;
    }
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [step, targetRef]);

  const isLast = step === 3;
  const message = TOUR_MESSAGES[step];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end p-4 pb-8"
      aria-modal
      role="dialog"
      aria-label="Тур по интерфейсу"
    >
      {/* Затемнение: для последнего шага — всё экран, иначе «дырка» вокруг цели */}
      {step === 3 ? (
        <div className="pointer-events-none fixed inset-0 bg-black/50" />
      ) : rect ? (
        <div
          className="pointer-events-none fixed rounded-lg"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
          }}
        />
      ) : null}

      {/* Рамка подсветки вокруг элемента (не на последнем шаге) */}
      {step !== 3 && rect && (
        <div
          className="pointer-events-none fixed rounded-lg border-2 border-primary"
          style={{
            left: Math.max(0, rect.left - 2),
            top: Math.max(0, rect.top - 2),
            width: rect.width + 4,
            height: rect.height + 4,
          }}
        />
      )}

      {/* Тултип */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl">
        <p className="pixel-font mb-4 text-sm leading-relaxed text-foreground">{message}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button variant="secondary" size="sm" onClick={onSkip} className="flex-1">
            Пропустить
          </Button>
          <Button variant="default" size="sm" onClick={onNext} className="flex-1">
            {isLast ? "Понятно" : "Далее"}
          </Button>
        </div>
      </div>
    </div>
  );
}
