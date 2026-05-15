import "server-only";
import type { Locale } from "./config";
import en from "./dictionaries/en.json";

export type Dictionary = typeof en;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => Promise.resolve(en),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  "pt-PT": () =>
    import("./dictionaries/pt-PT.json").then((m) => m.default),
  "pt-BR": () =>
    import("./dictionaries/pt-BR.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  loaders[locale]();
