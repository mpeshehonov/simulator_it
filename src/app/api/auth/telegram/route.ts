import { NextResponse } from "next/server";
import { validateInitData, parseInitDataUser } from "@/lib/telegram/validate";
import { getPlayerCookieHeader } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";
import type { ProfessionId } from "@/lib/game/professions";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData as string | undefined;

    if (!initData || !validateInitData(initData)) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    const user = parseInitDataUser(initData);
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

    const profession = (body.profession as ProfessionId) ?? "frontend";
    const validProfessions = ["frontend", "backend", "qa", "devops", "uiux"];
    const safeProfession = validProfessions.includes(profession) ? profession : "frontend";

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
        skills: {},
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert player error:", error);
      return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
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
