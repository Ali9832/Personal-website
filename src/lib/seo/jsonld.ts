import {
  type Article,
  type BreadcrumbList,
  type FAQPage,
  type Person,
  type Service as ServiceSchemaType,
  type Thing,
  type WebSite,
  type WithContext,
} from "schema-dts";
import { intlLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { authorName, site } from "@/lib/site";
import { type CaseStudy, type Faq, type Post, type Service } from "@/lib/content/schemas";
import { absoluteUrl, href, ogImagePath, routes } from "./routes";

/**
 * Stable @id values let the separate graphs reference one another, so the
 * Person emitted on every page is understood as one entity rather than eight.
 */
export const ids = {
  person: `${site.url}/#person`,
  website: `${site.url}/#website`,
} as const;

export function personJsonLd(locale: Locale): WithContext<Person> {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": ids.person,
    name: authorName(locale),
    url: absoluteUrl(href(locale)),
    email: `mailto:${site.author.email}`,
    jobTitle: dict.meta.role,
    description: dict.meta.description,
    image: absoluteUrl(ogImagePath(locale, "")),
    knowsAbout: [...site.knowsAbout],
    address: {
      "@type": "PostalAddress",
      addressCountry: site.locations.countryCode,
    },
    sameAs: [site.author.github, site.author.linkedin, site.author.telegram],
  };
}

export function webSiteJsonLd(locale: Locale): WithContext<WebSite> {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ids.website,
    name: dict.meta.siteName,
    url: absoluteUrl(href(locale)),
    inLanguage: intlLocale[locale],
    description: dict.meta.description,
    publisher: { "@id": ids.person },
  };
}

export function serviceJsonLd(locale: Locale, service: Service): WithContext<ServiceSchemaType> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(href(locale, `${routes.services}/${service.slug}`))}#service`,
    name: service.h1,
    description: service.metaDescription,
    serviceType: service.primaryKeyword,
    url: absoluteUrl(href(locale, `${routes.services}/${service.slug}`)),
    provider: { "@id": ids.person },
    areaServed: { "@type": "Country", name: site.locations.country[locale] },
    ...(service.priceFrom && service.priceCurrency
      ? {
          offers: {
            "@type": "Offer" as const,
            price: service.priceFrom,
            priceCurrency: service.priceCurrency === "IRT" ? "IRR" : "USD",
            availability: "https://schema.org/InStock" as const,
          },
        }
      : {}),
  };
}

export function articleJsonLd(
  locale: Locale,
  post: Post,
  options: { wordCount: number },
): WithContext<Article> {
  const url = absoluteUrl(href(locale, `${routes.blog}/${post.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    inLanguage: intlLocale[locale],
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt ?? post.publishedAt).toISOString(),
    author: { "@id": ids.person },
    publisher: { "@id": ids.person },
    keywords: post.tags.join(", "),
    wordCount: options.wordCount,
    image: absoluteUrl(post.cover ?? ogImagePath(locale, `${routes.blog}/${post.slug}`)),
  };
}

export function caseStudyJsonLd(locale: Locale, study: CaseStudy): WithContext<Article> {
  const url = absoluteUrl(href(locale, `${routes.portfolio}/${study.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#casestudy`,
    mainEntityOfPage: url,
    url,
    headline: study.title,
    description: study.metaDescription,
    inLanguage: intlLocale[locale],
    datePublished: new Date(Date.UTC(study.year, 0, 1)).toISOString(),
    dateModified: (study.updatedAt ?? new Date(Date.UTC(study.year, 11, 31))).toISOString(),
    author: { "@id": ids.person },
    publisher: { "@id": ids.person },
    about: study.stack.join(", "),
    image: absoluteUrl(study.cover),
  };
}

export function faqJsonLd(faq: Faq[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question" as const,
      name: item.q,
      acceptedAnswer: { "@type": "Answer" as const, text: item.a },
    })),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(locale: Locale, crumbs: Crumb[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(href(locale, crumb.path)),
    })),
  };
}

export type { Thing, WithContext };
