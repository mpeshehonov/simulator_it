"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

const CANVAS_W = 320;
const CANVAS_H = 240;
const PLAYER_W = 24;
const PLAYER_H = 24;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 6;
const BULLET_W = 4;
const BULLET_H = 12;
const BUG_W = 20;
const BUG_H = 20;
const BUG_ROWS = 3;
const BUG_COLS = 4;
const BUG_SPEED_X = 0.2;
const BUG_SPEED_Y = 0.5;
const BUG_DROP_FRAMES = 380;
const SCORE_PER_BUG = 10;

type GameState = "start" | "playing" | "end";
type GameResult = "won" | "lost";

interface Bullet {
  x: number;
  y: number;
}

interface Bug {
  x: number;
  y: number;
  alive: boolean;
}

export interface FixBugsGameProps {
  onComplete: (score: number) => void;
  disabled?: boolean;
}

export function FixBugsGame({ onComplete, disabled }: FixBugsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const keysRef = useRef<{ left: boolean; right: boolean; fire: boolean }>({
    left: false,
    right: false,
    fire: false,
  });

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    scoreRef.current = 0;
    setGameResult(null);
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    runningRef.current = true;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    let playerX = (CANVAS_W - PLAYER_W) / 2;
    const playerY = CANVAS_H - PLAYER_H - 10;
    const bullets: Bullet[] = [];
    const bugs: Bug[] = [];
    let bugDir = 1;
    let bugDropCounter = 0;
    let fireCooldown = 0;
    let aliveCount = BUG_ROWS * BUG_COLS;

    // Spawn bugs in grid
    const gapX = (CANVAS_W - BUG_COLS * BUG_W) / (BUG_COLS + 1);
    const gapY = 24;
    for (let row = 0; row < BUG_ROWS; row++) {
      for (let col = 0; col < BUG_COLS; col++) {
        bugs.push({
          x: gapX + col * (BUG_W + gapX),
          y: 20 + row * (BUG_H + gapY),
          alive: true,
        });
      }
    }

    function gameLoop() {
      if (!runningRef.current) return;

      // Player movement
      if (keysRef.current.left) playerX = Math.max(0, playerX - PLAYER_SPEED);
      if (keysRef.current.right) playerX = Math.min(CANVAS_W - PLAYER_W, playerX + PLAYER_SPEED);

      // Fire
      if (fireCooldown > 0) fireCooldown--;
      if (keysRef.current.fire && fireCooldown <= 0) {
        bullets.push({
          x: playerX + PLAYER_W / 2 - BULLET_W / 2,
          y: playerY - BULLET_H,
        });
        fireCooldown = 12;
      }

      // Move bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        if (bullets[i].y < -BULLET_H) bullets.splice(i, 1);
      }

      // Move bugs
      bugDropCounter++;
      let shouldDrop = false;
      if (bugDropCounter >= BUG_DROP_FRAMES) {
        bugDropCounter = 0;
        shouldDrop = true;
      }
      const minBugX = 0;
      const maxBugX = CANVAS_W - BUG_W;
      for (const b of bugs) {
        if (!b.alive) continue;
        b.x += BUG_SPEED_X * bugDir;
        b.x = Math.max(minBugX, Math.min(maxBugX, b.x));
        if (shouldDrop) b.y += BUG_SPEED_Y;
      }
      if (shouldDrop) bugDir *= -1;

      // Отскок от краёв: развернуть направление и сбросить кадры до следующего дропа
      let edge = 0;
      for (const b of bugs) {
        if (!b.alive) continue;
        if (b.x <= minBugX) edge = -1;
        if (b.x >= maxBugX) edge = 1;
      }
      if (edge !== 0) {
        bugDir = -edge;
        bugDropCounter = 0;
        for (const b of bugs) {
          if (b.alive) b.y += BUG_SPEED_Y;
        }
      }

      // Collision bullet vs bug
      for (const bullet of bullets) {
        for (const bug of bugs) {
          if (!bug.alive) continue;
          if (
            bullet.x < bug.x + BUG_W &&
            bullet.x + BULLET_W > bug.x &&
            bullet.y < bug.y + BUG_H &&
            bullet.y + BULLET_H > bug.y
          ) {
            bug.alive = false;
            bullet.y = -100;
            scoreRef.current += SCORE_PER_BUG;
            setScore((s) => s + SCORE_PER_BUG);
            aliveCount--;
          }
        }
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < -50) bullets.splice(i, 1);
      }

      // Game over: bug reached bottom (проигрыш)
      for (const b of bugs) {
        if (b.alive && b.y + BUG_H >= playerY) {
          runningRef.current = false;
          setGameResult("lost");
          setGameState("end");
          return;
        }
      }
      if (aliveCount <= 0) {
        runningRef.current = false;
        setGameResult("won");
        setGameState("end");
        return;
      }

      // Draw
      c.fillStyle = "#0f172a";
      c.fillRect(0, 0, CANVAS_W, CANVAS_H);

      c.fillStyle = "#22c55e";
      for (const b of bullets) {
        c.fillRect(b.x, b.y, BULLET_W, BULLET_H);
      }

      c.font = "16px monospace";
      c.textAlign = "center";
      c.fillStyle = "#f59e0b";
      for (const b of bugs) {
        if (!b.alive) continue;
        c.fillText("🐛", b.x + BUG_W / 2, b.y + BUG_H - 4);
      }

      // Скобка } повёрнута на 90° — остриём вверх, будто из неё вылетают лучи
      const cx = playerX + PLAYER_W / 2;
      const cy = playerY + PLAYER_H / 2;
      c.save();
      c.translate(cx, cy);
      c.rotate(-Math.PI / 2);
      c.fillStyle = "#e2e8f0";
      c.font = "20px monospace";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("}", 0, 0);
      c.restore();

      c.fillStyle = "#94a3b8";
      c.font = "12px monospace";
      c.textAlign = "left";
      c.fillText(`Очки: ${scoreRef.current}`, 8, 16);

      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keysRef.current.left = true;
      if (e.code === "ArrowRight") keysRef.current.right = true;
      if (e.code === "Space") {
        e.preventDefault();
        keysRef.current.fire = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keysRef.current.left = false;
      if (e.code === "ArrowRight") keysRef.current.right = false;
      if (e.code === "Space") keysRef.current.fire = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [gameState]);

  if (gameState === "start") {
    return (
      <div
        className="flex flex-col items-center gap-6 select-none"
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        <p className="pixel-font text-center text-xs text-muted-foreground">
          Управление: кнопки влево / стрелять / вправо под полем. Уничтожь багов, не дай им дойти до
          низа.
        </p>
        <button
          type="button"
          onClick={startGame}
          disabled={disabled}
          className="touch-manipulation pixel-font min-h-[48px] w-full rounded border-2 border-primary bg-primary/20 px-4 py-4 text-base font-medium text-primary transition-colors active:bg-primary/40 disabled:opacity-50"
        >
          Начать игру · {ENERGY_PER_ACTION} ⚡
        </button>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div
        className="flex flex-col items-center gap-5 select-none"
        style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block rounded border-2 border-border bg-slate-900"
          style={{ width: "100%", maxWidth: CANVAS_W, imageRendering: "pixelated" }}
        />
        <div className="flex w-full gap-4">
          <button
            type="button"
            className="touch-manipulation flex-1 select-none rounded-xl border-2 border-border bg-muted/60 py-4 pixel-font text-2xl active:bg-muted"
            onTouchStart={(e) => {
              e.preventDefault();
              keysRef.current.left = true;
            }}
            onTouchEnd={() => (keysRef.current.left = false)}
            onTouchCancel={() => (keysRef.current.left = false)}
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            onMouseLeave={() => (keysRef.current.left = false)}
          >
            ←
          </button>
          <button
            type="button"
            className="touch-manipulation flex-1 select-none rounded-xl border-2 border-border bg-muted/60 py-4 pixel-font text-2xl active:bg-muted"
            onTouchStart={(e) => {
              e.preventDefault();
              keysRef.current.fire = true;
            }}
            onTouchEnd={() => (keysRef.current.fire = false)}
            onTouchCancel={() => (keysRef.current.fire = false)}
            onMouseDown={() => (keysRef.current.fire = true)}
            onMouseUp={() => (keysRef.current.fire = false)}
            onMouseLeave={() => (keysRef.current.fire = false)}
          >
            🔫
          </button>
          <button
            type="button"
            className="touch-manipulation flex-1 select-none rounded-xl border-2 border-border bg-muted/60 py-4 pixel-font text-2xl active:bg-muted"
            onTouchStart={(e) => {
              e.preventDefault();
              keysRef.current.right = true;
            }}
            onTouchEnd={() => (keysRef.current.right = false)}
            onTouchCancel={() => (keysRef.current.right = false)}
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            onMouseLeave={() => (keysRef.current.right = false)}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setGameState("start");
    setScore(0);
    setGameResult(null);
  };

  return (
    <div
      className="flex flex-col items-center gap-6 select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      <p className="pixel-font text-center text-sm">
        {gameResult === "won" ? "Победа! Очки:" : "Проиграли. Очки:"} <strong>{score}</strong>
      </p>
      <div className="flex w-full flex-col gap-4">
        {gameResult === "lost" ? (
          <>
            <button
              type="button"
              onClick={handleRetry}
              className="touch-manipulation pixel-font min-h-[48px] w-full rounded-xl border-2 border-primary bg-primary px-4 py-4 text-base text-primary-foreground hover:bg-primary/90 active:bg-primary/90"
            >
              Повторить попытку · {ENERGY_PER_ACTION} ⚡
            </button>
            <button
              type="button"
              onClick={() => onComplete(score)}
              disabled={disabled}
              className="touch-manipulation pixel-font min-h-[48px] w-full rounded-xl border-2 border-border px-4 py-4 text-base active:bg-muted/50 disabled:opacity-50"
            >
              Завершить с текущими очками
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onComplete(score)}
              disabled={disabled}
              className="touch-manipulation pixel-font min-h-[48px] w-full rounded-xl border-2 border-primary bg-primary px-4 py-4 text-base text-primary-foreground hover:bg-primary/90 active:bg-primary/90 disabled:opacity-50"
            >
              Завершить и получить награду
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="touch-manipulation pixel-font min-h-[48px] w-full rounded-xl border-2 border-border px-4 py-4 text-base active:bg-muted/50"
            >
              Ещё раз · {ENERGY_PER_ACTION} ⚡
            </button>
          </>
        )}
      </div>
    </div>
  );
}
