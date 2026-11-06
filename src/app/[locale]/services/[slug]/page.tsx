import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, otherLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatPrice } from "@/lib/i18n/format";
import {
  getCaseStudiesForService,
  getPostsForService,
  getService,
  getServices,
  translationSlug,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { routes, serviceHref } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Prose } from "@/components/ui/Prose";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Mdx } from "@/components/mdx/Mdx";
import { CheckList } from "@/components/sections/CheckList";
import { StepList } from "@/components/sections/StepList";
import { Faq } from "@/components/sections/Faq";
import { WorkGrid } from "@/components/sections/WorkCard";
import { PostGrid } from "@/components/sections/PostCard";
import { CtaBand } from "@/components/sections/CtaBand";

type Params = { locale: Locale; slug: string };

export function generateStaticParams(): Params[] {
  return locales.flatMap((locale) =>
    getServices(locale).map((doc) => ({ locale, slug: doc.data.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getService(locale, slug);
  if (!doc) return {};

  const other = otherLocale(locale);
  const otherSlug = translationSlug("services", doc.data.translationKey, other);

  return buildMetadata({
    locale,
    path: `${routes.services}/${slug}`,
    title: doc.data.h1,
    metaTitle: doc.data.metaTitle ?? doc.data.title,
    description: doc.data.metaDescription,
    modifiedTime: doc.data.updatedAt,
    alternates: {
      [locale]: `${routes.services}/${slug}`,
      ...(otherSlug ? { [other]: `${routes.services}/${otherSlug}` } : {}),
    },
  });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const doc = getService(locale, slug);
  if (!doc) notFound();

  const dict = getDictionary(locale);
  const { data } = doc;

  const related = data.relatedServices
    .map((s) => getService(locale, s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const work = getCaseStudiesForService(locale, slug);
  const posts = getPostsForService(locale, slug, 3);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.services, path: routes.services },
    { name: data.navLabel, path: `${routes.services}/${slug}` },
  ];

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        {/* The one h1 on this page. */}
        <h1 className="text-3xl text-balance">{data.h1}</h1>
        <p className="measure mt-4 text-lg text-muted">{data.summary}</p>

        {data.priceFrom && data.priceCurrency && (
          <p className="mt-6">
            <Badge tone="accent" className="nums">
              {dict.common.priceFrom} {formatPrice(data.priceFrom, data.priceCurrency, locale)}
            </Badge>
          </p>
        )}
      </Container>

      <Section title={dict.common.deliverables} headingLevel={2}>
        <CheckList items={data.deliverables} />
      </Section>

      <Section tone="sunk" title={dict.common.process}>
        <StepList steps={data.process} locale={locale} />
      </Section>

      <Section size="narrow">
        <Prose>
          <Mdx source={doc.body} />
        </Prose>
      </Section>

      {work.length > 0 && (
        <Section tone="sunk" title={dict.services.workTitle}>
          <WorkGrid docs={work} locale={locale} />
        </Section>
      )}

      {posts.length > 0 && (
        <Section title={dict.services.postsTitle}>
          <PostGrid docs={posts} locale={locale} />
        </Section>
      )}

      <Section tone="sunk" size="narrow">
        <Faq items={data.faq} title={dict.common.faqTitle} id="faq" />
      </Section>

      {related.length > 0 && (
        <Section title={dict.services.relatedTitle}>
          <ul className="flex flex-wrap gap-3">
            {related.map((item) => (
              <li key={item.data.slug}>
                <Link
                  href={serviceHref(locale, item.data.slug)}
                  className="inline-flex rounded-(--radius-md) border border-border px-4 py-2 text-sm font-medium no-underline transition-colors duration-(--dur) hover:border-accent hover:text-accent-text"
                >
                  {item.data.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        locale={locale}
        title={dict.services.ctaTitle}
        body={dict.services.ctaBody}
        cta={dict.common.startProject}
      />

      <JsonLd
        data={[
          serviceJsonLd(locale, data),
          faqJsonLd(data.faq),
          breadcrumbJsonLd(locale, crumbs),
        ]}
      />
    </>
  );
}
