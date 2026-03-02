import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import { executeLearn, executeTask, executeRest } from "@/lib/game/action";
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

    const player = rowToPlayer(row);

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

    const { error: updateError } = await supabase
      .from("players")
      .update({
        energy: result.player.energy,
        exp: result.player.exp,
        money: result.player.money,
        reputation: result.player.reputation,
        updated_at: new Date().toISOString(),
      })
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
