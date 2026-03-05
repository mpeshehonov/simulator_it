import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import { executeAction, getActionDefinition, ALL_ACTION_IDS } from "@/lib/game/actions";
import { applyPassiveEnergyRegen } from "@/lib/game/energy";
import { getPartnerChannelById } from "@/lib/game/channels";

export async function POST(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized", code: "unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action.trim() : "";
    const payload = body.payload;

    if (!action || !ALL_ACTION_IDS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Allowed: ${ALL_ACTION_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: row, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (fetchError || !row) {
      return NextResponse.json(
        { ok: false, error: "Player not found", code: "player_not_found" },
        { status: 404 }
      );
    }

    const regen = applyPassiveEnergyRegen(row.energy, row.energy_updated_at);
    if (regen.energy !== row.energy) {
      await supabase
        .from("players")
        .update({
          energy: regen.energy,
          energy_updated_at: regen.energyUpdatedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramId);
    }
    const rowWithRegen = { ...row, energy: regen.energy, energy_updated_at: regen.energyUpdatedAt };
    const player = rowToPlayer(rowWithRegen);

    if (action === "partner_subscribe") {
      const channelId = typeof payload?.channelId === "string" ? payload.channelId.trim() : "";
      const channel = channelId ? getPartnerChannelById(channelId) : undefined;
      if (!channel) {
        return NextResponse.json(
          { error: "Укажите канал (channelId) или канал не найден" },
          { status: 400 }
        );
      }
      const { data: existing } = await supabase
        .from("player_channel_subscriptions")
        .select("channel_id")
        .eq("player_id", row.id)
        .eq("channel_id", channelId)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "Вы уже получали награду за подписку на этот канал" },
          { status: 400 }
        );
      }
      await supabase.from("player_channel_subscriptions").insert({
        player_id: row.id,
        channel_id: channelId,
      });
    }

    let result;
    try {
      result = executeAction(action, player, payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Action failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const lastEventJson =
      result.event != null
        ? {
            title: result.event.title,
            description: result.event.description,
            ...(result.event.hint ? { hint: result.event.hint } : {}),
          }
        : null;

    const updatePayload: Record<string, unknown> = {
      energy: result.player.energy,
      exp: result.player.exp,
      money: result.player.money,
      reputation: result.player.reputation,
      ...(lastEventJson !== null && { last_event: lastEventJson }),
      updated_at: new Date().toISOString(),
    };

    const actionDef = getActionDefinition(action);
    if (actionDef?.id === "rest" && result.player.lastRestAt != null) {
      updatePayload.last_rest_at = result.player.lastRestAt;
    }

    const { error: updateError } = await supabase
      .from("players")
      .update(updatePayload)
      .eq("telegram_id", telegramId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      player: result.player,
      event: result.event,
      expGained: result.expGained,
      moneyGained: result.moneyGained,
    });
  } catch (e) {
    console.error("Action error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
