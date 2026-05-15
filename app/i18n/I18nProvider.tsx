"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

const DictContext = createContext<Dictionary | null>(null);
const LocaleContext = createContext<Locale | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext value={locale}>
      <DictContext value={dict}>{children}</DictContext>
    </LocaleContext>
  );
}

export function useDict(): Dictionary {
  const d = useContext(DictContext);
  if (!d) throw new Error("useDict must be used inside I18nProvider");
  return d;
}

export function useLocale(): Locale {
  const l = useContext(LocaleContext);
  if (!l) throw new Error("useLocale must be used inside I18nProvider");
  return l;
}
