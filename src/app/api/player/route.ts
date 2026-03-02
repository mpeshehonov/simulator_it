import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/lib/db/player";

export async function GET(request: Request) {
  try {
    const telegramId = await getTelegramIdFromRequest(request);
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
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

    return NextResponse.json({ player: rowToPlayer(data) });
  } catch (e) {
    console.error("Player GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
