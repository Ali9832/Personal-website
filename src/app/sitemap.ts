import { type MetadataRoute } from "next";
import { hreflang, locales, type Locale } from "@/lib/i18n/config";
import { getCaseStudies, getPosts, getServices, translationSlug } from "@/lib/content";
import { absoluteUrl, href, indexableStaticRoutes, routes } from "@/lib/seo/routes";

export const dynamic = "force-static";

/**
 * Built from the same readers the pages use, so a new MDX file appears in the
 * sitemap without anyone remembering to add it. Every entry carries its
 * hreflang alternates, which is what Google actually reads for pairing.
 */
function alternatesFor(paths: Partial<Record<Locale, string>>): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const path = paths[locale];
    if (path === undefined) continue;
    languages[hreflang[locale]] = absoluteUrl(href(locale, path));
  }
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const key of indexableStaticRoutes) {
    const path = routes[key];
    const languages = alternatesFor(Object.fromEntries(locales.map((l) => [l, path])));
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(href(locale, path)),
        lastModified: now,
        changeFrequency: key === "blog" || key === "home" ? "weekly" : "monthly",
        priority: key === "home" ? 1 : key === "services" ? 0.9 : 0.7,
        alternates: { languages },
      });
    }
  }

  for (const locale of locales) {
    for (const doc of getServices(locale)) {
      const other = locales.find((l) => l !== locale)!;
      const otherSlug = translationSlug("services", doc.data.translationKey, other);
      entries.push({
        url: absoluteUrl(href(locale, `${routes.services}/${doc.data.slug}`)),
        lastModified: doc.data.updatedAt ?? now,
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: {
          languages: alternatesFor({
            [locale]: `${routes.services}/${doc.data.slug}`,
            ...(otherSlug ? { [other]: `${routes.services}/${otherSlug}` } : {}),
          }),
        },
      });
    }

    for (const doc of getCaseStudies(locale)) {
      const other = locales.find((l) => l !== locale)!;
      const otherSlug = translationSlug("portfolio", doc.data.translationKey, other);
      entries.push({
        url: absoluteUrl(href(locale, `${routes.portfolio}/${doc.data.slug}`)),
        lastModified: doc.data.updatedAt ?? now,
        changeFrequency: "yearly",
        priority: 0.8,
        alternates: {
          languages: alternatesFor({
            [locale]: `${routes.portfolio}/${doc.data.slug}`,
            ...(otherSlug ? { [other]: `${routes.portfolio}/${otherSlug}` } : {}),
          }),
        },
      });
    }

    for (const doc of getPosts(locale)) {
      const other = locales.find((l) => l !== locale)!;
      const otherSlug = translationSlug("blog", doc.data.translationKey, other);
      entries.push({
        url: absoluteUrl(href(locale, `${routes.blog}/${doc.data.slug}`)),
        lastModified: doc.data.updatedAt ?? doc.data.publishedAt,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: alternatesFor({
            [locale]: `${routes.blog}/${doc.data.slug}`,
            ...(otherSlug ? { [other]: `${routes.blog}/${otherSlug}` } : {}),
          }),
        },
      });
    }
  }

  return entries;
}
