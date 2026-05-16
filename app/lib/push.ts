import "server-only";
import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
const subject = process.env.VAPID_SUBJECT ?? "mailto:timertempoapp@gmail.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type PushPayload = {
  title: string;
  body: string;
  tag?: string;
  url?: string;
};

export function vapidPublicKey() {
  return publicKey;
}

export async function sendPush(
  subscription: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<{ ok: boolean; expired?: boolean; error?: string }> {
  if (!publicKey || !privateKey) {
    return { ok: false, error: "VAPID keys not configured" };
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 300,
    });
    return { ok: true };
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    if (e?.statusCode === 410 || e?.statusCode === 404) {
      return { ok: false, expired: true };
    }
    return { ok: false, error: e?.message ?? String(err) };
  }
}
