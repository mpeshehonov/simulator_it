import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { PARTNER_CHANNELS } from "@/lib/game/channels";

export async function GET(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    const supabase = createAdminClient();

    const channels = PARTNER_CHANNELS.map((c) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      expReward: c.expReward,
      sortOrder: c.sortOrder,
    }));

    let completedIds: string[] = [];
    if (telegramId) {
      const { data: row } = await supabase
        .from("players")
        .select("id")
        .eq("telegram_id", telegramId)
        .single();
      if (row?.id) {
        const { data: subs } = await supabase
          .from("player_channel_subscriptions")
          .select("channel_id")
          .eq("player_id", row.id);
        completedIds = (subs ?? []).map((s) => s.channel_id);
      }
    }

    return NextResponse.json({ channels, completedIds });
  } catch (e) {
    console.error("Channels API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
