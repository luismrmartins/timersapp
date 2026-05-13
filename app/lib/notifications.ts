let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      audioContext = new AC();
    } catch {
      return null;
    }
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function unlockAudio() {
  getAudioContext();
}

export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime + 0.01;
  const note = (
    freq: number,
    offset: number,
    duration: number,
    peak = 0.18,
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t0 = start + offset;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  };

  note(880, 0, 0.22); // A5
  note(1108.73, 0.18, 0.22); // C#6
  note(1318.51, 0.36, 0.5); // E6
}

export function isNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationsSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export async function sendBrowserNotification(
  title: string,
  body: string,
  tag?: string,
) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    tag: tag ?? body,
  };

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    } catch {
      // fall through to direct Notification below
    }
  }

  try {
    new Notification(title, options);
  } catch {
    // ignore
  }
}
