import { NextResponse } from "next/server";

export async function POST(_request: Request) {
  // TODO: start interview, submit answers
  return NextResponse.json({ ok: true });
}
