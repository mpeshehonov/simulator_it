"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export type AnimatedNumberVariant = "increase" | "decrease" | "neutral";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  /** Разница к предыдущему значению: положительная — зелёная подсветка, отрицательная — красная */
  delta?: number;
  className?: string;
  /** Длительность подсветки (ms) */
  highlightDuration?: number;
  /** Длительность анимации отсчёта (ms), 0 = без анимации */
  countDuration?: number;
}

export function AnimatedNumber({
  value,
  suffix = "",
  delta,
  className,
  highlightDuration = 800,
  countDuration = 400,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [variant, setVariant] = useState<AnimatedNumberVariant>("neutral");
  const [deltaVisible, setDeltaVisible] = useState(false);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    const diff = value - prev;
    const nextVariant: AnimatedNumberVariant =
      diff > 0 ? "increase" : diff < 0 ? "decrease" : "neutral";
    const id = requestAnimationFrame(() => {
      setVariant(nextVariant);
      setDeltaVisible(true);
    });
    const clearHighlight = () => {
      setVariant("neutral");
      setDeltaVisible(false);
    };
    const highlightTimer = window.setTimeout(clearHighlight, highlightDuration);

    if (countDuration <= 0) {
      const id0 = requestAnimationFrame(() => setDisplayValue(value));
      prevValueRef.current = value;
      return () => {
        cancelAnimationFrame(id0);
        window.clearTimeout(highlightTimer);
      };
    }

    const startTime = performance.now();
    const startValue = prev;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / countDuration, 1);
      const easeOut = 1 - (1 - t) * (1 - t);
      const current = Math.round(startValue + (value - startValue) * easeOut);
      setDisplayValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = value;
        setDisplayValue(value);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(highlightTimer);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [value, highlightDuration, countDuration]);

  return (
    <span
      className={cn(
        "inline-block transition-colors duration-200",
        variant === "increase" && "text-green-600 dark:text-green-400 animate-pulse-subtle",
        variant === "decrease" && "text-red-600 dark:text-red-400 animate-pulse-subtle",
        className
      )}
    >
      {displayValue}
      {suffix}
      {deltaVisible && delta != null && delta !== 0 && (
        <span
          className={cn(
            "ml-1 text-xs font-medium opacity-90",
            delta > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </span>
  );
}
