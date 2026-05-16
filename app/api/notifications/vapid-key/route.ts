import { NextResponse } from "next/server";
import { vapidPublicKey } from "@/app/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = vapidPublicKey();
  return NextResponse.json({ key: key || null });
}
