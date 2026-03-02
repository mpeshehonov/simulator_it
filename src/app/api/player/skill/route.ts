import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import { SKILL_UPGRADE_EXP_COST } from "@/lib/game/constants";
import { PROFESSION_SKILL_BRANCHES } from "@/lib/game/professions";

export async function POST(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const branchId = body.branchId as string | undefined;

    if (!branchId || typeof branchId !== "string") {
      return NextResponse.json({ error: "branchId required (string)" }, { status: 400 });
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

    const profession = row.profession as keyof typeof PROFESSION_SKILL_BRANCHES;
    const branches = PROFESSION_SKILL_BRANCHES[profession];
    const branch = branches?.find((b) => b.id === branchId);

    if (!branch) {
      return NextResponse.json(
        { error: `Invalid branchId for profession ${profession}` },
        { status: 400 }
      );
    }

    const skills = (row.skills as Record<string, number>) ?? {};
    const currentLevel = skills[branchId] ?? 0;

    if (currentLevel >= branch.maxLevel) {
      return NextResponse.json(
        { error: `Skill "${branch.name}" is already max level (${branch.maxLevel})` },
        { status: 400 }
      );
    }

    const expCost = SKILL_UPGRADE_EXP_COST;
    const playerExp = Number(row.exp) ?? 0;

    if (playerExp < expCost) {
      return NextResponse.json(
        { error: `Need ${expCost} EXP (you have ${playerExp})` },
        { status: 400 }
      );
    }

    const newSkills = { ...skills, [branchId]: currentLevel + 1 };

    const { data: updated, error: updateError } = await supabase
      .from("players")
      .update({
        exp: playerExp - expCost,
        skills: newSkills,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Skill upgrade error:", updateError);
      return NextResponse.json({ error: "Failed to upgrade skill" }, { status: 500 });
    }

    return NextResponse.json({
      player: rowToPlayer(updated),
      upgradedBranch: branchId,
      newLevel: currentLevel + 1,
    });
  } catch (e) {
    console.error("Skill POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
