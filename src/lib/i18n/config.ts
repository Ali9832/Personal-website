export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

/** Persian is the default: `/` redirects here. */
export const defaultLocale: Locale = "fa";

export const localeDir: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};

/** Value for <html lang>. */
export const htmlLang: Record<Locale, string> = {
  fa: "fa",
  en: "en",
};

/** BCP-47 tag handed to Intl.* — region matters for calendars and numerals. */
export const intlLocale: Record<Locale, string> = {
  fa: "fa-IR",
  en: "en-US",
};

/** hreflang value. */
export const hreflang: Record<Locale, string> = {
  fa: "fa",
  en: "en",
};

/** Endonym, for the language switcher. */
export const localeName: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

export const localeOgTag: Record<Locale, string> = {
  fa: "fa_IR",
  en: "en_US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** The other locale — there are exactly two, so a switcher needs no list. */
export function otherLocale(locale: Locale): Locale {
  return locale === "fa" ? "en" : "fa";
}

export const LOCALE_COOKIE = "NEXT_LOCALE";
