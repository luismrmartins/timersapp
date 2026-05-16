"use client";

let cachedKey: string | null = null;

async function fetchVapidKey(): Promise<string | null> {
  if (cachedKey) return cachedKey;
  try {
    const res = await fetch("/api/notifications/vapid-key", {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { key: string | null };
    if (!json.key) return null;
    cachedKey = json.key;
    return cachedKey;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getOrCreatePushSubscription(): Promise<PushSubscriptionJSON | null> {
  if (!isPushSupported()) return null;
  if (Notification.permission !== "granted") return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const key = await fetchVapidKey();
      if (!key) return null;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
    }
    return sub.toJSON();
  } catch {
    return null;
  }
}

type ScheduleInput = {
  id: string;
  fireAt: number;
  title: string;
  body: string;
  tag?: string;
};

export async function schedulePush(input: ScheduleInput): Promise<void> {
  const sub = await getOrCreatePushSubscription();
  if (!sub || !sub.endpoint || !sub.keys) return;
  try {
    await fetch("/api/notifications/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...input,
        subscription: {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
      }),
      keepalive: true,
    });
  } catch {
    // best-effort; in-app notification still fires if user is on the page
  }
}

export async function unschedulePush(id: string): Promise<void> {
  if (!isPushSupported()) return;
  try {
    await fetch("/api/notifications/unschedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}
