import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import { executeLearn, executeTask, executeRest } from "@/lib/game/action";
import { applyPassiveEnergyRegen } from "@/lib/game/energy";
import type { ActionType } from "@/types/game";

export async function POST(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action as ActionType;

    if (!action || !["learn", "task", "rest"].includes(action)) {
      return NextResponse.json({ error: "Invalid action: learn | task | rest" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: row, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
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

    let result;
    try {
      switch (action) {
        case "learn":
          result = executeLearn(player);
          break;
        case "task":
          result = executeTask(player);
          break;
        case "rest":
          result = executeRest(player);
          break;
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Action failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const lastEventJson =
      result.event != null
        ? { title: result.event.title, description: result.event.description }
        : null;

    const updatePayload: Record<string, unknown> = {
      energy: result.player.energy,
      exp: result.player.exp,
      money: result.player.money,
      reputation: result.player.reputation,
      ...(lastEventJson !== null && { last_event: lastEventJson }),
      updated_at: new Date().toISOString(),
    };

    if (action === "rest" && result.player.lastRestAt != null) {
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
