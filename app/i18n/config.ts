export const locales = [
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt-PT",
  "pt-BR",
  "ja",
  "zh-CN",
] as const;
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
  it: "Italiano",
  "pt-PT": "Português (PT)",
  "pt-BR": "Português (BR)",
  ja: "日本語",
  "zh-CN": "简体中文",
};
