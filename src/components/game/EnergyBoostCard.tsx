"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/pixelact-ui";
import {
  STARS_ENERGY_BOOST,
  STARS_ENERGY_BOOST_PRICE,
  STARS_FULL_RESTORE_PRICE,
} from "@/lib/game/constants";

type ProductType = "energy_boost" | "full_restore";

interface EnergyBoostCardProps {
  initData: string | null;
  onPurchased?: () => void;
}

export function EnergyBoostCard({ initData, onPurchased }: EnergyBoostCardProps) {
  const [loading, setLoading] = useState<ProductType | null>(null);

  const handleBuy = async (productType: ProductType) => {
    if (!initData) return;
    setLoading(productType);
    try {
      const res = await fetch("/api/stars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData,
        },
        body: JSON.stringify({ productType }),
      });
      const data = await res.json().catch(() => ({}));

      if (!data.ok) {
        return;
      }

      const invoiceUrl = (data as { invoice_url?: string }).invoice_url;
      if (invoiceUrl && typeof window !== "undefined" && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceUrl, (success) => {
          if (success && onPurchased) onPurchased();
        });
      } else {
        const err = (data as { error?: string }).error;
        window.Telegram?.WebApp?.showAlert?.(
          err ?? "Не удалось создать платёж. Проверьте настройки бота."
        );
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="pixel-font text-sm">Буст энергии</CardTitle>
        <p className="pixel-font text-[10px] text-muted-foreground leading-relaxed">
          Telegram Stars — оплата внутри Telegram
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="w-full items-center justify-between gap-2 overflow-hidden"
          disabled={!!loading}
          onClick={() => handleBuy("energy_boost")}
        >
          <span className="truncate text-left text-[11px] sm:text-xs">
            +{STARS_ENERGY_BOOST} энергии
          </span>
          <span className="pixel-font text-primary shrink-0">
            {STARS_ENERGY_BOOST_PRICE} ⭐
          </span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full items-center justify-between gap-2 overflow-hidden"
          disabled={!!loading}
          onClick={() => handleBuy("full_restore")}
        >
          <span className="truncate text-left text-[11px] sm:text-xs">
            Полное восстановление
          </span>
          <span className="pixel-font text-primary shrink-0">
            {STARS_FULL_RESTORE_PRICE} ⭐
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
