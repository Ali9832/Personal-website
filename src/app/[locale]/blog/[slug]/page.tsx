import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, otherLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate, isoDate, readingTimeLabel } from "@/lib/i18n/format";
import { getPost, getPosts, getRelatedPosts, getService, translationSlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { routes, serviceHref } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Mdx } from "@/components/mdx/Mdx";
import { Faq } from "@/components/sections/Faq";
import { PostGrid } from "@/components/sections/PostCard";

type Params = { locale: Locale; slug: string };

export function generateStaticParams(): Params[] {
  return locales.flatMap((locale) =>
    getPosts(locale).map((doc) => ({ locale, slug: doc.data.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getPost(locale, slug);
  if (!doc) return {};

  const other = otherLocale(locale);
  const otherSlug = translationSlug("blog", doc.data.translationKey, other);

  return buildMetadata({
    locale,
    path: `${routes.blog}/${slug}`,
    title: doc.data.title,
    metaTitle: doc.data.metaTitle,
    description: doc.data.metaDescription,
    type: "article",
    publishedTime: doc.data.publishedAt,
    modifiedTime: doc.data.updatedAt,
    tags: doc.data.tags,
    image: doc.data.cover,
    alternates: {
      [locale]: `${routes.blog}/${slug}`,
      ...(otherSlug ? { [other]: `${routes.blog}/${otherSlug}` } : {}),
    },
  });
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const doc = getPost(locale, slug);
  if (!doc) notFound();

  const dict = getDictionary(locale);
  const { data } = doc;
  const service = getService(locale, data.relatedService);
  const related = getRelatedPosts(locale, doc, 3);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.blog, path: routes.blog },
    { name: data.title, path: `${routes.blog}/${slug}` },
  ];

  return (
    <>
      <Container size="narrow" className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />

        <article>
          <header>
            <h1 className="text-3xl text-balance">{data.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
              <time dateTime={isoDate(data.publishedAt)} className="nums">
                {formatDate(data.publishedAt, locale)}
              </time>
              <span aria-hidden="true">·</span>
              <span className="nums">{readingTimeLabel(doc.readingTimeMinutes, locale)}</span>
              {data.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="nums">
                    {dict.common.updatedOn} {formatDate(data.updatedAt, locale)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-lg text-muted">{data.description}</p>
          </header>

          <Prose className="mt-10">
            <Mdx source={doc.body} />
          </Prose>
        </article>

        <ul className="mt-10 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <li key={tag} className="text-xs text-subtle">
              #{tag}
            </li>
          ))}
        </ul>

        {data.faq && data.faq.length > 0 && (
          <div className="mt-14">
            <Faq items={data.faq} title={dict.common.faqTitle} />
          </div>
        )}

        {/* Every post links out to the service it belongs to — the schema
            makes `relatedService` required, so this block is never missing. */}
        {service && (
          <aside className="mt-14 rounded-(--radius-lg) border border-accent-border bg-accent-wash p-6">
            <p className="text-xs font-medium tracking-wide text-accent-text uppercase">
              {dict.common.relatedService}
            </p>
            <h2 className="mt-2 text-lg font-bold">
              <Link href={serviceHref(locale, service.data.slug)} className="no-underline">
                {service.data.h1}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{service.data.summary}</p>
          </aside>
        )}
      </Container>

      {related.length > 0 && (
        <Section tone="sunk" title={dict.common.relatedPosts} className="mt-16">
          <PostGrid docs={related} locale={locale} />
        </Section>
      )}

      <JsonLd
        data={[
          articleJsonLd(locale, data, { wordCount: doc.wordCount }),
          ...(data.faq && data.faq.length > 0 ? [faqJsonLd(data.faq)] : []),
          breadcrumbJsonLd(locale, crumbs),
        ]}
      />
    </>
  );
}
