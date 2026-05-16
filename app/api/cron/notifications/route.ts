import { NextResponse } from "next/server";
import { dueNotifications, unschedule } from "@/app/lib/schedule-store";
import { sendPush } from "@/app/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
  // when CRON_SECRET is set as an env var on the project.
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const now = Date.now();
  const due = await dueNotifications(now);
  if (!due.length) {
    return NextResponse.json({ fired: 0, due: 0 });
  }
  let fired = 0;
  let expired = 0;
  for (const { id, data } of due) {
    const result = await sendPush(data.subscription, {
      title: data.title,
      body: data.body,
      tag: data.tag,
    });
    if (result.ok) {
      fired++;
      await unschedule(id);
    } else if (result.expired) {
      expired++;
      await unschedule(id);
    }
  }
  return NextResponse.json({ fired, expired, due: due.length });
}
