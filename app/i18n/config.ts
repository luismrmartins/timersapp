export const locales = ["en", "fr", "de", "es", "pt-PT", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  "pt-PT": "Português (PT)",
  "pt-BR": "Português (BR)",
};
