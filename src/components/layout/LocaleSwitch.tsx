"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { hreflang, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

/**
 * Persian and English slugs are independent (`behinesazi-sorat-site` ↔
 * `site-speed-optimization`), so the target URL cannot be derived by swapping
 * the path prefix. The correct pair is already in the document head as the
 * hreflang link Next emits from `generateMetadata`, so this reads it from
 * there instead of duplicating the mapping in a second place.
 *
 * The href is patched on the DOM node rather than held in state: it is a
 * one-way sync from an external source (the head) to one attribute, so there
 * is no reason to spend a render on it.
 *
 * Server-rendered href is the other locale's home page, so with JavaScript
 * disabled the link still works and never lands on a 404.
 */
export function LocaleSwitch({
  target,
  label,
  fallbackHref,
}: {
  target: Locale;
  label: string;
  fallbackHref: string;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const anchor = ref.current;
    if (!anchor) return;
    const link = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang[target]}"]`,
    );
    const raw = link?.getAttribute("href");
    if (!raw) {
      anchor.href = fallbackHref;
      return;
    }

    // hreflang is absolute against the configured canonical host. Take only
    // the path from it, so the switch stays on whatever origin the visitor is
    // actually on — localhost, a staging domain, or an IP before DNS points.
    try {
      const url = new URL(raw, window.location.origin);
      anchor.href = `${url.pathname}${url.search}`;
    } catch {
      anchor.href = fallbackHref;
    }
  }, [pathname, target, fallbackHref]);

  return (
    <a
      ref={ref}
      href={fallbackHref}
      hrefLang={hreflang[target]}
      aria-label={label}
      onClick={() => {
        // Remember the choice so the bare-root redirect honours it next time.
        document.cookie = `${LOCALE_COOKIE}=${target};path=/;max-age=31536000;samesite=lax`;
      }}
      className="inline-flex h-9 items-center rounded-(--radius-md) border border-border px-3 text-sm font-medium text-muted no-underline transition-colors duration-(--dur) hover:border-border-strong hover:text-text"
    >
      {target === "en" ? "EN" : "فا"}
    </a>
  );
}
