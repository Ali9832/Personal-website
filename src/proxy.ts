import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * Next 16 renamed the `middleware` file convention to `proxy`.
 *
 * URL shape: Persian is unprefixed (`/services/speed`), English is prefixed
 * (`/en/services/speed`). Persian is the primary market, so its URLs are the
 * short ones and the site reads as a Persian site that also has English.
 *
 * Three rules, in order:
 *
 *  1. `/fa/...` is never a public URL. The pages physically live under the
 *     `[locale]` tree, so those paths resolve — which would make every
 *     Persian document reachable at two addresses. They 308 onto the
 *     unprefixed form so only one can ever be indexed.
 *  2. A real locale prefix (`/en/...`) passes straight through.
 *  3. Everything else is rewritten — not redirected — into the Persian tree.
 *     The visitor's URL stays clean; Next renders `[locale]` with `fa`.
 *
 * Note there is deliberately no Accept-Language redirect on `/`. Serving a
 * different language at the canonical home URL depending on who asks splits
 * the signal Google gets for it, and Googlebot crawls from a US locale — it
 * would index the English page as the Persian home page. `/` is Persian for
 * everyone; the header switch is how an English speaker moves.
 */

const PREFIX = `/${defaultLocale}`;

export default function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) {
    const stripped = pathname.slice(PREFIX.length) || "/";
    return NextResponse.redirect(new URL(`${stripped}${search}`, request.url), 308);
  }

  if (isLocale(pathname.split("/")[1])) {
    return NextResponse.next();
  }

  const internal = pathname === "/" ? PREFIX : `${PREFIX}${pathname}`;
  return NextResponse.rewrite(new URL(`${internal}${search}`, request.url));
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, static asset folders and
    // any path that already looks like a file (robots.txt, sitemap.xml, ...).
    "/((?!api|_next/static|_next/image|og|media|fonts|.*\\..*).*)",
  ],
};
