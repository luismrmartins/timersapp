import { NextResponse } from "next/server";
import { unschedule } from "@/app/lib/schedule-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body?.id) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await unschedule(body.id);
  return NextResponse.json({ ok: true });
}
