"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";
import { locales, localeNames, type Locale } from "../i18n/config";
import { useDict, useLocale } from "../i18n/I18nProvider";

export default function LangSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();
  const dict = useDict();
  const [open, setOpen] = useState(false);

  const switchTo = (next: Locale) => {
    setOpen(false);
    if (next === current) return;
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const segments = pathname.split("/");
    if (segments[1] === current) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join("/") || `/${next}`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.header.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center justify-center p-1.5 text-[var(--fg)]/70 hover:text-[var(--fg)]"
      >
        <Icon name="language" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-md border border-[var(--fg)]/20 bg-[var(--bg)] py-1 font-mono text-xs shadow-lg"
          >
            {locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l === current}
                  onClick={() => switchTo(l)}
                  className={
                    "w-full px-3 py-1.5 text-left uppercase tracking-widest hover:bg-[var(--fg)]/10 " +
                    (l === current
                      ? "text-[var(--fg)]"
                      : "text-[var(--fg)]/70")
                  }
                >
                  {localeNames[l]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
