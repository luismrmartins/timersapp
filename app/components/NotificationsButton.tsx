"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  isNotificationsSupported,
  requestNotificationPermission,
} from "../lib/notifications";

export default function NotificationsButton() {
  const [perm, setPerm] = useState<NotificationPermission | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPerm(getNotificationPermission());
  }, []);

  if (!mounted) return null;
  if (!isNotificationsSupported()) return null;
  if (perm === "denied") return null;

  if (perm === "granted") {
    return (
      <span
        aria-label="Notifications enabled"
        className="inline-flex items-center gap-2 border border-[var(--fg)]/20 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70"
      >
        Notify
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 bg-[var(--fg)]"
        />
      </span>
    );
  }

  const onClick = async () => {
    const result = await requestNotificationPermission();
    setPerm(result);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[var(--fg)]/20 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]"
    >
      Notify
    </button>
  );
}
