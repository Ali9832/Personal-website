import { type Metadata } from "next";
import {
  defaultLocale,
  hreflang,
  localeOgTag,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { authorName, isStaging, ogImageSize, site } from "@/lib/site";
import { absoluteUrl, href, ogImagePath } from "./routes";

/**
 * Locale → path (without the locale prefix) for the same document.
 * Omitting a locale means "no translation exists", and it is then left out of
 * hreflang rather than pointed at a 404.
 */
export type Alternates = Partial<Record<Locale, string>>;

type BuildMetadataInput = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/services/speed-optimization". */
  path: string;
  title: string;
  description: string;
  /** Overrides the <title>; use when the SERP title should differ from the H1. */
  metaTitle?: string;
  alternates?: Alternates;
  type?: "website" | "article" | "profile";
  publishedTime?: Date;
  modifiedTime?: Date;
  tags?: string[];
  noIndex?: boolean;
  /** Absolute or root-relative image; defaults to the generated OG card. */
  image?: string;
};

function languageAlternates(
  currentLocale: Locale,
  path: string,
  alternates?: Alternates,
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const locale of locales) {
    const localePath =
      locale === currentLocale ? path : alternates?.[locale];
    // No explicit alternate and no matching translation: skip, do not guess.
    if (localePath === undefined) continue;
    map[hreflang[locale]] = absoluteUrl(href(locale, localePath));
  }

  const fallback = alternates?.[defaultLocale] ?? (currentLocale === defaultLocale ? path : undefined);
  if (fallback !== undefined) {
    map["x-default"] = absoluteUrl(href(defaultLocale, fallback));
  }

  return map;
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    locale,
    path,
    title,
    description,
    metaTitle,
    alternates,
    type = "website",
    publishedTime,
    modifiedTime,
    tags,
    noIndex = false,
    image,
  } = input;

  // A staging host must never be indexable, whatever the page asked for.
  const blockIndexing = noIndex || isStaging;

  const dict = getDictionary(locale);
  const url = absoluteUrl(href(locale, path));
  const ogImage = image ?? ogImagePath(locale, path);

  return {
    title: metaTitle ?? title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(locale, path, alternates),
    },
    robots: blockIndexing
      ? {
          index: false,
          follow: !isStaging,
          nocache: isStaging,
          googleBot: { index: false, follow: !isStaging },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: type === "profile" ? "profile" : type,
      url,
      title: metaTitle ?? title,
      description,
      siteName: dict.meta.siteName,
      locale: localeOgTag[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeOgTag[l]),
      images: [
        {
          url: absoluteUrl(ogImage),
          width: ogImageSize.width,
          height: ogImageSize.height,
          alt: title,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime: publishedTime?.toISOString(),
            modifiedTime: (modifiedTime ?? publishedTime)?.toISOString(),
            authors: [authorName(locale)],
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle ?? title,
      description,
      images: [absoluteUrl(ogImage)],
    },
    authors: [{ name: authorName(locale), url: site.url }],
    creator: authorName(locale),
  };
}
