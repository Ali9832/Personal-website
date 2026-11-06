import { type Metadata, type Viewport } from "next";
import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import "../globals.css";

import { htmlLang, isLocale, localeDir, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { personJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeScript } from "@/components/layout/ThemeScript";

/**
 * This is the root layout. There is no `app/layout.tsx`, because `lang` and
 * `dir` on <html> depend on the locale segment — a wrapper above it could
 * only guess.
 */

type Params = { locale: string };

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

/**
 * Only `fa` and `en` exist. Paths containing a dot skip the proxy (it treats
 * them as files), so scanner probes like `/wp-login.php` or `/.env` used to
 * reach this tree with `locale = "wp-login.php"`, crash every page that reads
 * the dictionary, and answer 500. With this they are a plain 404.
 */
export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    verification: {
      google: "f6mHv9FbzBhrWngkG9Si3b4-6RQum7c0yeobyLzr0s4",
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    title: {
      default: dict.meta.title,
      template: dict.meta.titleTemplate,
    },
    ...buildMetadata({
      locale,
      path: routes.home,
      title: dict.meta.title,
      description: dict.meta.description,
      alternates: { fa: routes.home, en: routes.home },
      type: "profile",
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <html
      lang={htmlLang[locale]}
      dir={localeDir[locale]}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <SkipLink label={dict.nav.skipToContent} />
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
        <JsonLd data={[personJsonLd(locale), webSiteJsonLd(locale)]} />
      </body>
    </html>
  );
}
