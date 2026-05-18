"use client";

import { useEffect } from "react";
import Icon from "./Icon";
import { useDict } from "../i18n/I18nProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function InstallPwaModal({ open, onClose }: Props) {
  const dict = useDict();
  const t = dict.installPwa;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--fg)]/40 p-4 font-mono"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[10px] border border-[var(--fg)]/20 bg-[var(--bg)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-normal text-[var(--fg)]">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
            className="px-2 py-0.5 text-sm text-[var(--fg)]/70 hover:text-[var(--fg)]"
          >
            ×
          </button>
        </div>

        <p className="text-sm leading-relaxed text-[var(--fg)]/70">{t.intro}</p>

        <ol className="mt-6 flex flex-col gap-4">
          <Step n={1} icon="ios_share" label={t.step1} />
          <Step n={2} icon="add_box" label={t.step2} />
          <Step n={3} icon="check" label={t.step3} />
        </ol>

        <p className="mt-6 border-t border-dotted border-[var(--fg)]/20 pt-4 text-xs leading-relaxed text-[var(--fg)]/50">
          {t.afterInstall}
        </p>
      </div>
    </div>
  );
}

function Step({ n, icon, label }: { n: number; icon: string; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--fg)]/30 text-[10px] tabular-nums text-[var(--fg)]/70">
        {n}
      </span>
      <Icon name={icon} className="mt-0.5 shrink-0 text-xl text-[var(--fg)]/60" />
      <span className="text-sm leading-relaxed text-[var(--fg)]">{label}</span>
    </li>
  );
}
