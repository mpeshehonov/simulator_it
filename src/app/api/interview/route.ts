import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import {
  EXP_FOR_INTERVIEW,
  INTERVIEW_COOLDOWN_DAYS,
} from "@/lib/game/constants";
import {
  getInterviewSuccessChance,
  pickInterviewQuestions,
  rollInterviewSuccess,
} from "@/lib/game/interview";
import type { ProfessionId } from "@/lib/game/professions";

function getCooldownLeftMs(lastAt: string | null): number {
  if (!lastAt) return 0;
  const last = new Date(lastAt).getTime();
  const now = Date.now();
  const cdMs = INTERVIEW_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const left = last + cdMs - now;
  return Math.max(0, left);
}

export async function GET(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (error || !row) {
      return NextResponse.json({ ok: false, error: "player_not_found" }, { status: 404 });
    }

    const player = rowToPlayer(row);
    if (player.level >= 5) {
      return NextResponse.json(
        { ok: false, error: "max_level", message: "Вы уже на максимальном уровне." },
        { status: 400 }
      );
    }

    const requiredExp = EXP_FOR_INTERVIEW[player.level] ?? 0;
    if (player.exp < requiredExp) {
      return NextResponse.json(
        {
          ok: false,
          error: "not_enough_exp",
          requiredExp,
          currentExp: player.exp,
        },
        { status: 400 }
      );
    }

    const cooldownLeftMs = getCooldownLeftMs(player.lastInterviewAt);
    if (cooldownLeftMs > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "cooldown",
          cooldownLeftMs,
        },
        { status: 400 }
      );
    }

    const chance = getInterviewSuccessChance(player.skills, player.reputation);
    const questions = pickInterviewQuestions(player.profession as ProfessionId);

    return NextResponse.json({
      ok: true,
      player,
      questions,
      chance,
      requiredExp,
    });
  } catch (e) {
    console.error("Interview GET error:", e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (error || !row) {
      return NextResponse.json({ ok: false, error: "player_not_found" }, { status: 404 });
    }

    const player = rowToPlayer(row);
    if (player.level >= 5) {
      return NextResponse.json(
        { ok: false, error: "max_level", message: "Вы уже на максимальном уровне." },
        { status: 400 }
      );
    }

    const requiredExp = EXP_FOR_INTERVIEW[player.level] ?? 0;
    if (player.exp < requiredExp) {
      return NextResponse.json(
        {
          ok: false,
          error: "not_enough_exp",
          requiredExp,
          currentExp: player.exp,
        },
        { status: 400 }
      );
    }

    const cooldownLeftMs = getCooldownLeftMs(player.lastInterviewAt);
    if (cooldownLeftMs > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "cooldown",
          cooldownLeftMs,
        },
        { status: 400 }
      );
    }

    const chance = getInterviewSuccessChance(player.skills, player.reputation);
    const success = rollInterviewSuccess(chance);
    const nowIso = new Date().toISOString();

    const newLevel = success && player.level < 5 ? player.level + 1 : player.level;
    const reputationPenalty = success ? 0 : 2;
    const newReputation = Math.max(0, player.reputation - reputationPenalty);

    const updatePayload: Record<string, unknown> = {
      level: newLevel,
      reputation: newReputation,
      last_interview_at: nowIso,
      updated_at: nowIso,
    };

    const { error: updateError } = await supabase
      .from("players")
      .update(updatePayload)
      .eq("telegram_id", telegramId);

    if (updateError) {
      console.error("Interview update error:", updateError);
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }

    const updatedPlayer = {
      ...player,
      level: newLevel,
      reputation: newReputation,
      lastInterviewAt: nowIso,
    };

    return NextResponse.json({
      ok: true,
      success,
      chance,
      requiredExp,
      player: updatedPlayer,
    });
  } catch (e) {
    console.error("Interview POST error:", e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
