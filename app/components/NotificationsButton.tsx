"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
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
        className="inline-flex items-center border border-[var(--fg)]/20 px-3 py-2 text-[var(--fg)]/70"
      >
        <Icon name="notifications_active" />
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
      aria-label="Enable notifications"
      className="border border-[var(--fg)]/20 px-3 py-2 text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)]"
    >
      <Icon name="notifications" />
    </button>
  );
}
