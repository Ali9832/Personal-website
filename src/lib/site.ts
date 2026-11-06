import { type Locale } from "@/lib/i18n/config";

/**
 * Non-translated constants. Anything that reads as prose lives in the
 * dictionaries instead; anything that is an identifier lives here.
 */

/** The production origin. Used whenever a production build has no usable NEXT_PUBLIC_SITE_URL. */
export const PRODUCTION_URL = "https://alifatehi.ir";

const isLocalOrigin = (url: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?\/?$/i.test(url);

/**
 * NEXT_PUBLIC_* is inlined at build time, so the origin is fixed by whatever
 * environment `next build` ran in — and a hosting panel can hand the build an
 * empty value or a leftover `http://localhost:3000`. Both shipped localhost in
 * every canonical, hreflang, robots and sitemap URL, and made the contact
 * form's Origin check reject every real visitor.
 *
 * So: a real, non-local value always wins (staging hosts set theirs). A local
 * or missing value only survives under `next dev`; any production build or
 * server falls back to PRODUCTION_URL.
 */
function readSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (raw && !isLocalOrigin(raw)) return raw.replace(/\/+$/, "");

  const isDevServer =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PHASE !== "phase-production-build";
  if (isDevServer) return (raw || "http://localhost:3000").replace(/\/+$/, "");

  return PRODUCTION_URL;
}

export const siteUrl = readSiteUrl();

/**
 * A staging build is a byte-identical copy of the site on a different host.
 * Left alone, Google indexes it and it competes with the real domain for the
 * exact keywords the real domain is trying to rank for — and the staging
 * host, having no links, usually loses in a way that drags both down.
 *
 * Set SITE_ENV=staging for any deploy that is not the canonical domain. It
 * forces `noindex, nofollow` onto every page and turns robots.txt into a
 * blanket disallow.
 */
export const isStaging = process.env.SITE_ENV === "staging";

export const site = {
  /** TODO: swap once the domain is registered — this is the only place it lives. */
  url: siteUrl,
  author: {
    name: { fa: "علی فاتحی", en: "Ali Fatehi" },
    email: "alifatehi1379@gmail.com",
    /** TODO: fill in your real handles. */
    telegram: "https://t.me/scgtp1",
    github: "https://github.com/alifatehi",
    linkedin: "https://www.linkedin.com/in/alifatehi",
  },
  /** Used by the Person JSON-LD `knowsAbout` field. */
  knowsAbout: [
    "WordPress",
    "WooCommerce",
    "WordPress Plugin Development",
    "PHP",
    "Next.js",
    "React",
    "TypeScript",
    "Python",
    "MySQL",
    "PostgreSQL",
    "Core Web Vitals",
    "Web Performance Optimization",
    "Chrome Extension Development",
    "Technical SEO",
  ],
  locations: {
    country: { fa: "ایران", en: "Iran" },
    countryCode: "IR",
  },
} as const;

export function authorName(locale: Locale): string {
  return site.author.name[locale];
}

export const ogImageSize = { width: 1200, height: 630 } as const;
