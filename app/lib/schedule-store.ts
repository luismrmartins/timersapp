import "server-only";
import { redis } from "./redis";
import type { PushSubscriptionRecord } from "./push";

export type ScheduledNotification = {
  subscription: PushSubscriptionRecord;
  title: string;
  body: string;
  tag: string;
};

const PENDING_KEY = "notif:pending";
const itemKey = (id: string) => `notif:${id}`;

export async function schedule(
  id: string,
  fireAtMs: number,
  data: ScheduledNotification,
): Promise<void> {
  // TTL = time until fire + 10 minute grace. Bounded to >= 60s so very
  // imminent notifications still survive a brief cron delay.
  const ttlSec = Math.max(
    60,
    Math.ceil((fireAtMs - Date.now()) / 1000) + 600,
  );
  await Promise.all([
    redis.set(itemKey(id), data, { ex: ttlSec }),
    redis.zadd(PENDING_KEY, { score: fireAtMs, member: id }),
  ]);
}

export async function unschedule(id: string): Promise<void> {
  await Promise.all([
    redis.del(itemKey(id)),
    redis.zrem(PENDING_KEY, id),
  ]);
}

export async function dueNotifications(
  nowMs: number,
): Promise<Array<{ id: string; data: ScheduledNotification }>> {
  const ids = (await redis.zrange(PENDING_KEY, 0, nowMs, {
    byScore: true,
  })) as string[];
  if (!ids.length) return [];
  const out: Array<{ id: string; data: ScheduledNotification }> = [];
  for (const id of ids) {
    const data = (await redis.get(
      itemKey(id),
    )) as ScheduledNotification | null;
    if (data) out.push({ id, data });
  }
  return out;
}
