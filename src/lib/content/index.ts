import { type Locale, locales } from "@/lib/i18n/config";
import { loadCollection, type Doc } from "./reader";
import {
  caseStudySchema,
  postSchema,
  serviceSchema,
  type CaseStudy,
  type Post,
  type Service,
} from "./schemas";

export type ServiceDoc = Doc<Service>;
export type CaseStudyDoc = Doc<CaseStudy>;
export type PostDoc = Doc<Post>;

/* ------------------------------------------------------------------ services */

export function getServices(locale: Locale): ServiceDoc[] {
  return loadCollection("services", locale, serviceSchema).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

export function getService(locale: Locale, slug: string): ServiceDoc | undefined {
  return getServices(locale).find((d) => d.data.slug === slug);
}

/* ---------------------------------------------------------------- portfolio */

export function getCaseStudies(locale: Locale): CaseStudyDoc[] {
  return loadCollection("portfolio", locale, caseStudySchema).sort((a, b) => {
    if (a.data.year !== b.data.year) return b.data.year - a.data.year;
    return a.data.order - b.data.order;
  });
}

export function getCaseStudy(locale: Locale, slug: string): CaseStudyDoc | undefined {
  return getCaseStudies(locale).find((d) => d.data.slug === slug);
}

export function getFeaturedCaseStudies(locale: Locale, limit = 3): CaseStudyDoc[] {
  const all = getCaseStudies(locale);
  const featured = all.filter((d) => d.data.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export function getCaseStudiesForService(locale: Locale, serviceSlug: string): CaseStudyDoc[] {
  return getCaseStudies(locale).filter((d) => d.data.service === serviceSlug);
}

/* --------------------------------------------------------------------- blog */

export function getPosts(locale: Locale): PostDoc[] {
  return loadCollection("blog", locale, postSchema).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function getPost(locale: Locale, slug: string): PostDoc | undefined {
  return getPosts(locale).find((d) => d.data.slug === slug);
}

export function getPostsForService(locale: Locale, serviceSlug: string, limit = 3): PostDoc[] {
  return getPosts(locale)
    .filter((d) => d.data.relatedService === serviceSlug)
    .slice(0, limit);
}

export function getRelatedPosts(locale: Locale, post: PostDoc, limit = 3): PostDoc[] {
  const explicit = post.data.relatedPosts
    .map((slug) => getPost(locale, slug))
    .filter((d): d is PostDoc => Boolean(d));
  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Fall back to same-service posts, then shared tags, so a post is never a
  // dead end even before `relatedPosts` is filled in.
  const seen = new Set([post.data.slug, ...explicit.map((d) => d.data.slug)]);
  const candidates = getPosts(locale).filter((d) => !seen.has(d.data.slug));
  const sameService = candidates.filter((d) => d.data.relatedService === post.data.relatedService);
  const sharedTag = candidates.filter((d) =>
    d.data.tags.some((t) => post.data.tags.includes(t)),
  );

  const merged: PostDoc[] = [...explicit];
  for (const doc of [...sameService, ...sharedTag]) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.data.slug === doc.data.slug)) merged.push(doc);
  }
  return merged.slice(0, limit);
}

/* ------------------------------------------------------------- translations */

type AnyDoc = Doc<{ slug: string; translationKey: string }>;

/**
 * The slug of the same document in the other locale. Returns undefined when
 * the translation does not exist yet, which is what makes hreflang honest
 * instead of pointing at a 404.
 */
export function translationSlug(
  collection: "services" | "portfolio" | "blog",
  translationKey: string,
  targetLocale: Locale,
): string | undefined {
  const docs: AnyDoc[] =
    collection === "services"
      ? getServices(targetLocale)
      : collection === "portfolio"
        ? getCaseStudies(targetLocale)
        : getPosts(targetLocale);
  return docs.find((d) => d.data.translationKey === translationKey)?.data.slug;
}

export function allSlugs(
  collection: "services" | "portfolio" | "blog",
): Array<{ locale: Locale; slug: string }> {
  return locales.flatMap((locale) => {
    const docs: AnyDoc[] =
      collection === "services"
        ? getServices(locale)
        : collection === "portfolio"
          ? getCaseStudies(locale)
          : getPosts(locale);
    return docs.map((d) => ({ locale, slug: d.data.slug }));
  });
}

export * from "./schemas";
export type { Doc } from "./reader";
