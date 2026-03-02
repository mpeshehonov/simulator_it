import { NextResponse } from "next/server";
import { validateInitData, parseInitDataUser } from "@/lib/telegram/validate";
import { getPlayerCookieHeader } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import {
  type ProfessionId,
  PROFESSION_SKILL_BRANCHES,
} from "@/lib/game/professions";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;

    const validation = validateInitData(initData ?? "");
    if (!validation.ok) {
      if (validation.reason === "no_token") {
        console.error("[auth] TELEGRAM_BOT_TOKEN not set in env");
        return NextResponse.json(
          { error: "Server config error" },
          { status: 500 }
        );
      }
      if (validation.reason === "no_init_data") {
        return NextResponse.json(
          { error: "No initData. Open the app from Telegram." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: "Invalid initData",
          hint:
            validation.reason === "invalid_signature"
              ? "Check TELEGRAM_BOT_TOKEN in Vercel matches the bot that opens the app"
              : undefined,
        },
        { status: 401 }
      );
    }

    const user = parseInitDataUser(initData!);
    if (!user) {
      return NextResponse.json({ error: "No user in initData" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", user.id)
      .single();

    if (existing) {
      const response = NextResponse.json({
        ok: true,
        player: rowToPlayer(existing),
      });
      response.headers.set("Set-Cookie", getPlayerCookieHeader(user.id));
      return response;
    }

    // Новый пользователь — требуется выбор профессии (онбординг)
    const profession = body.profession as ProfessionId | undefined;
    if (!profession) {
      return NextResponse.json({
        needsOnboarding: true,
        message: "Choose profession to start",
      });
    }

    const validProfessions = ["frontend", "backend", "qa", "devops", "uiux"];
    const safeProfession = validProfessions.includes(profession) ? profession : "frontend";

    const branches = PROFESSION_SKILL_BRANCHES[safeProfession];
    const skills: Record<string, number> = {};
    for (const b of branches) {
      skills[b.id] = 0;
    }

    const { data: inserted, error } = await supabase
      .from("players")
      .insert({
        telegram_id: user.id,
        profession: safeProfession,
        level: 0,
        exp: 0,
        money: 0,
        reputation: 0,
        energy: 10,
        skills,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert player error:", error);
      return NextResponse.json(
        {
          error: "Failed to create player",
          code: error.code,
          message: error.message,
          details: error.details,
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      player: rowToPlayer(inserted),
    });
    response.headers.set("Set-Cookie", getPlayerCookieHeader(user.id));
    return response;
  } catch (e) {
    console.error("Auth error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
