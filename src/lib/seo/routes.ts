import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site";

/**
 * One registry for every path in the site. Nav, footer, sitemap and
 * breadcrumbs all read from here, so a renamed route cannot be renamed in
 * three places and forgotten in a fourth.
 *
 * Path segments are identical across locales; only document slugs differ.
 */
export const routes = {
  home: "",
  services: "/services",
  portfolio: "/portfolio",
  blog: "/blog",
  products: "/products",
  about: "/about",
  contact: "/contact",
} as const;

export type RouteKey = keyof typeof routes;

/**
 * Header nav. `products` is deliberately absent until it has real content —
 * a "coming soon" item in the primary nav reads as an unfinished site.
 */
export const headerNav: RouteKey[] = [
  "services",
  "portfolio",
  "blog",
  "about",
  "contact",
];

/** Full list, used by the footer and the OG generator. */
export const navOrder: RouteKey[] = [
  "services",
  "portfolio",
  "blog",
  "products",
  "about",
  "contact",
];

/** Routes rendered as real pages with content (excludes products until phase 2). */
export const indexableStaticRoutes: RouteKey[] = [
  "home",
  "services",
  "portfolio",
  "blog",
  "about",
  "contact",
];

/**
 * Root-relative URL for a path in a given locale. Always starts with a slash
 * and always ends with one.
 *
 * The default locale is unprefixed (`/services/speed/`); every other locale
 * carries its prefix (`/en/services/speed/`). Nothing else in the codebase
 * builds a URL by hand, so this function is the whole rule.
 *
 * The trailing slash matters beyond cosmetics: the build emits directories
 * with an index file, Apache 308s the slashless form onto the slashed one,
 * and Next normalises canonical tags the same way. Without it here the
 * sitemap would list URLs that redirect — which is exactly the kind of
 * self-inflicted crawl waste that is invisible until someone audits it.
 */
export function href(locale: Locale, path: string = ""): string {
  const clean = path === "/" ? "" : path;
  const base = locale === defaultLocale ? clean : `/${locale}${clean}`;
  if (base === "") return "/";
  return base.endsWith("/") ? base : `${base}/`;
}

export function routeHref(locale: Locale, key: RouteKey): string {
  return href(locale, routes[key]);
}

export function serviceHref(locale: Locale, slug: string): string {
  return href(locale, `${routes.services}/${slug}`);
}

export function caseStudyHref(locale: Locale, slug: string): string {
  return href(locale, `${routes.portfolio}/${slug}`);
}

export function postHref(locale: Locale, slug: string): string {
  return href(locale, `${routes.blog}/${slug}`);
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * OG images are static files produced by scripts/generate-og.tsx. The key is
 * derived from the route so the generator and the metadata layer cannot drift.
 */
export function ogKey(locale: Locale, path: string): string {
  const slug = path.replace(/^\//, "").replace(/\//g, "--") || "home";
  return `${locale}--${slug}`;
}

export function ogImagePath(locale: Locale, path: string): string {
  return `/og/${ogKey(locale, path)}.png`;
}

export { locales, defaultLocale };
