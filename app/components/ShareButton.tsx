"use client";

import { useState } from "react";
import { encodeShare, timersToSteps } from "../lib/share";
import { useDict, useLocale } from "../i18n/I18nProvider";
import type { Timer } from "../types";

export default function ShareButton({ timers }: { timers: Timer[] }) {
  const dict = useDict();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (timers.length === 0) return;
    const url = `${window.location.origin}/${locale}?s=${encodeShare(
      timersToSteps(timers),
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(dict.library.copyLink, url);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={timers.length === 0}
      className="rounded-md border border-[var(--fg)]/20 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--fg)]/50 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? dict.library.linkCopied : dict.library.copyLink}
    </button>
  );
}
