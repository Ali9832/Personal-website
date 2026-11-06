import { intlLocale, type Locale } from "./config";

/**
 * Persian dates render on the Persian (Jalali) calendar and Persian dates are
 * what an Iranian visitor expects on a blog post. `Intl` does this natively
 * via the `-u-ca-persian` extension, so no date library ships to the client.
 */
function calendarLocale(locale: Locale): string {
  return locale === "fa" ? "fa-IR-u-ca-persian" : intlLocale[locale];
}

export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(calendarLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(calendarLocale(locale), {
    year: "numeric",
    month: "short",
  }).format(d);
}

/** Machine-readable value for <time dateTime> — always Gregorian ISO. */
export function isoDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale[locale], options).format(value);
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

const CURRENCY: Record<"IRT" | "USD", { fa: string; en: string }> = {
  IRT: { fa: "تومان", en: "IRR" },
  USD: { fa: "دلار", en: "USD" },
};

export function formatPrice(
  value: number,
  currency: "IRT" | "USD",
  locale: Locale,
): string {
  const n = formatNumber(value, locale, { maximumFractionDigits: 0 });
  return locale === "fa"
    ? `${n} ${CURRENCY[currency].fa}`
    : `${CURRENCY[currency].en} ${n}`;
}

const UNIT_LABEL: Record<string, { fa: string; en: string }> = {
  s: { fa: "ثانیه", en: "s" },
  ms: { fa: "میلی‌ثانیه", en: "ms" },
  "%": { fa: "٪", en: "%" },
  score: { fa: "امتیاز", en: "" },
  x: { fa: "برابر", en: "×" },
  req: { fa: "درخواست", en: "requests" },
  KB: { fa: "کیلوبایت", en: "KB" },
  count: { fa: "", en: "" },
};

export function formatMetricValue(
  value: number,
  unit: string,
  locale: Locale,
): string {
  const n = formatNumber(value, locale, { maximumFractionDigits: 2 });
  const label = UNIT_LABEL[unit];
  if (!label) return n;
  const suffix = locale === "fa" ? label.fa : label.en;
  if (!suffix) return n;
  return unit === "%" && locale === "fa" ? `${n}${suffix}` : `${n} ${suffix}`;
}

/**
 * Signed change in the measured value itself: -74 for 7.4s → 1.9s, +75 for
 * 1.2% → 2.1%. This is what gets printed, so a metric where higher is better
 * reads as a gain rather than a loss.
 */
export function signedChange(before: number, after: number): number {
  if (before === 0) return 0;
  return Math.round(((after - before) / before) * 100);
}

/**
 * Relative change expressed as a positive "improvement" percentage regardless
 * of which direction is good. Used to decide whether a change is good news,
 * never to render the number.
 */
export function improvement(
  before: number,
  after: number,
  direction: "lower-is-better" | "higher-is-better",
): number {
  if (before === 0) return 0;
  const raw =
    direction === "lower-is-better"
      ? ((before - after) / before) * 100
      : ((after - before) / before) * 100;
  return Math.round(raw);
}

export function readingTimeLabel(minutes: number, locale: Locale): string {
  const n = formatNumber(Math.max(1, Math.round(minutes)), locale);
  return locale === "fa" ? `${n} دقیقه مطالعه` : `${n} min read`;
}
