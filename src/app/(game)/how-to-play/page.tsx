"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";

export default function HowToPlayPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading } = usePlayer({ initData });

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

  if (initData && (isLoading || (initData && !player))) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto max-w-md space-y-8">
        <header className="py-4 text-center">
          <h1 className="pixel-font text-xl text-primary">Как играть</h1>
        </header>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Цель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="pixel-font text-xs text-muted-foreground">
              Вы — айтишник, который качает уровень, опыт и деньги. Учитесь, берите задачи, отдыхайте
              и проходите собеседования, чтобы подниматься по карьерной лестнице (от Безработного до
              Лида).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Энергия и действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="pixel-font text-xs text-muted-foreground">
              У вас есть энергия. Большинство действий тратят 1 энергию. Учёба даёт EXP, рабочая
              задача — EXP и деньги. Отдых восстанавливает энергию, но его можно использовать не
              чаще раза в 20 минут.
            </p>
            <p className="pixel-font text-xs text-muted-foreground">
              Энергия понемногу восстанавливается со временем сама.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Задания</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="pixel-font text-xs text-muted-foreground">
              Кнопка «Задания» ведёт в общий список: рабочая задача, подписка на партнёрские каналы
              (EXP за каждый канал), мини-игра «Фикс багов» и другие активности по мере появления.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Навыки и собеседование</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="pixel-font text-xs text-muted-foreground">
              Тратьте EXP на прокачку навыков профессии — это увеличивает доход и шанс пройти
              собеседование. Когда накопите достаточно EXP, откройте «Собеседование» и попробуйте
              перейти на следующий уровень (Стажёр → Джуниор → … → Лид).
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-2">
          <Link href="/">
            <Button variant="default">На главную</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
