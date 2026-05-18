"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import InstallPwaModal from "./InstallPwaModal";
import {
  getNotificationPermission,
  isIOS,
  isNotificationsSupported,
  isStandalonePWA,
  requestNotificationPermission,
} from "../lib/notifications";
import { useDict } from "../i18n/I18nProvider";

export default function NotificationsButton() {
  const dict = useDict();
  const [perm, setPerm] = useState<NotificationPermission | null>(null);
  const [supported, setSupported] = useState(false);
  const [needsInstall, setNeedsInstall] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supp = isNotificationsSupported();
    setSupported(supp);
    setPerm(supp ? getNotificationPermission() : null);
    // iOS Safari outside a PWA: Notification API is missing, but installing
    // to the Home Screen unlocks Web Push (iOS 16.4+).
    setNeedsInstall(!supp && isIOS() && !isStandalonePWA());
  }, []);

  if (!mounted) return null;

  if (!supported) {
    if (!needsInstall) return null;
    return (
      <>
        <button
          type="button"
          onClick={() => setInstallOpen(true)}
          aria-label={dict.header.installPwa}
          title={dict.header.installPwa}
          className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
        >
          <Icon name="notifications" />
        </button>
        <InstallPwaModal
          open={installOpen}
          onClose={() => setInstallOpen(false)}
        />
      </>
    );
  }

  if (perm === "denied") return null;

  if (perm === "granted") {
    return (
      <span
        aria-label={dict.header.notificationsEnabled}
        className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70"
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
      aria-label={dict.header.enableNotifications}
      className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
    >
      <Icon name="notifications" />
    </button>
  );
}
