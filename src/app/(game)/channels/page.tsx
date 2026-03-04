"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui";
import { useTelegram } from "@/hooks/useTelegram";
import { usePlayer } from "@/hooks/usePlayer";
import { LoadingScreen } from "@/components/game/LoadingScreen";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

interface ChannelItem {
  id: string;
  name: string;
  url: string;
  expReward: number;
  sortOrder: number;
}

export default function ChannelsPage() {
  const router = useRouter();
  const { initData, webApp } = useTelegram();
  const { player, isLoading, doAction } = usePlayer({ initData });
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    async function fetchChannels() {
      const opts: RequestInit = {
        headers: initData ? { "X-Telegram-Init-Data": initData } : {},
      };
      const res = await fetch("/api/channels", opts);
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (res.ok) {
        setChannels(data.channels ?? []);
        setCompletedIds(data.completedIds ?? []);
      }
      setLoadingChannels(false);
    }
    fetchChannels();
    return () => {
      cancelled = true;
    };
  }, [initData]);

  const handleConfirm = async (channelId: string) => {
    if (!player || actionLoading) return;
    setError(null);
    setActionLoading(channelId);
    try {
      const result = await doAction("partner_subscribe", { channelId });
      if (result?.ok) {
        setCompletedIds((prev) => (prev.includes(channelId) ? prev : [...prev, channelId]));
      } else {
        setError("Не удалось получить награду. Проверьте подписку и попробуйте снова.");
      }
    } catch {
      setError("Ошибка запроса");
    } finally {
      setActionLoading(null);
    }
  };

  const canAct = player && player.energy >= 1;

  if (!initData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
        <p className="text-center text-sm text-muted-foreground">Откройте приложение из Telegram.</p>
        <Link href="/">
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !player) {
    return <LoadingScreen />;
  }

  const sortedChannels = [...channels].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="app-safe-top min-h-screen bg-background px-4 pb-8">
      <div className="mx-auto max-w-md space-y-6">
        <header className="py-4 text-center">
          <h1 className="pixel-font text-xl text-primary">Подписка на каналы</h1>
          <p className="mt-2 pixel-font text-xs text-muted-foreground leading-relaxed">
            Подпишитесь на канал по ссылке, затем нажмите «Подтвердить». За каждый канал тратится 1
            энергия, награда — EXP (указан у канала).
          </p>
        </header>

        {error && (
          <p className="text-center pixel-font text-xs text-destructive">{error}</p>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="pixel-font text-sm">Партнёрские каналы</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loadingChannels ? (
              <p className="pixel-font text-xs text-muted-foreground">Загрузка…</p>
            ) : sortedChannels.length === 0 ? (
              <p className="pixel-font text-xs text-muted-foreground">Пока нет каналов.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedChannels.map((ch) => {
                  const completed = completedIds.includes(ch.id);
                  return (
                    <div
                      key={ch.id}
                      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
                    >
                      <div>
                        <p className="pixel-font text-sm font-medium">{ch.name}</p>
                        <p className="mt-0.5 pixel-font text-[10px] text-muted-foreground">
                          +{ch.expReward} EXP
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-3">
                        <a
                          href={ch.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button variant="secondary" size="sm" className="w-full">
                            Перейти
                          </Button>
                        </a>
                        {completed ? (
                          <Button variant="secondary" size="sm" className="w-full" disabled>
                            ✓ Получено
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            disabled={!canAct || actionLoading !== null}
                            onClick={() => handleConfirm(ch.id)}
                          >
                            {actionLoading === ch.id ? "..." : `Подтвердить · ${ENERGY_PER_ACTION} ⚡`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="w-full">
          <Link href="/tasks" className="block w-full">
            <Button variant="secondary" className="w-full">
              ← К заданиям
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
