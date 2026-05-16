import { NextResponse } from "next/server";
import { schedule } from "@/app/lib/schedule-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  id?: string;
  fireAt?: number;
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  title?: string;
  body?: string;
  tag?: string;
};

export async function POST(req: Request) {
  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (
    !data?.id ||
    !data?.fireAt ||
    !data?.subscription?.endpoint ||
    !data?.subscription?.keys?.p256dh ||
    !data?.subscription?.keys?.auth ||
    !data?.title
  ) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (data.fireAt <= Date.now() - 5000) {
    return NextResponse.json({ skipped: true });
  }
  await schedule(data.id, data.fireAt, {
    subscription: {
      endpoint: data.subscription.endpoint,
      keys: {
        p256dh: data.subscription.keys.p256dh,
        auth: data.subscription.keys.auth,
      },
    },
    title: data.title.slice(0, 200),
    body: (data.body ?? "").slice(0, 500),
    tag: (data.tag ?? data.id).slice(0, 200),
  });
  return NextResponse.json({ ok: true });
}
