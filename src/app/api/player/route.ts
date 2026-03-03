import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import { type ProfessionId, PROFESSION_SKILL_BRANCHES } from "@/lib/game/professions";
import { applyPassiveEnergyRegen } from "@/lib/game/energy";

export async function GET(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }
      console.error("Player fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
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

    const playerRow = { ...row, energy: regen.energy, energy_updated_at: regen.energyUpdatedAt };
    return NextResponse.json({ player: rowToPlayer(playerRow) });
  } catch (e) {
    console.error("Player GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const profession = body.profession as ProfessionId | undefined;

    if (!profession || !["frontend", "backend", "qa", "devops", "uiux"].includes(profession)) {
      return NextResponse.json(
        { error: "Invalid profession. Use: frontend, backend, qa, devops, uiux" },
        { status: 400 }
      );
    }

    const branches = PROFESSION_SKILL_BRANCHES[profession];
    const skills: Record<string, number> = {};
    for (const b of branches) {
      skills[b.id] = 0;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("players")
      .update({
        profession,
        skills,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId)
      .select("*")
      .single();

    if (error) {
      console.error("Player update error:", error);
      return NextResponse.json({ error: "Failed to update profession" }, { status: 500 });
    }

    return NextResponse.json({ player: rowToPlayer(data) });
  } catch (e) {
    console.error("Player PATCH error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
