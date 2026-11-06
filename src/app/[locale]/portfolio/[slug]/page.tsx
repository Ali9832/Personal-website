import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, otherLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatNumber } from "@/lib/i18n/format";
import { getCaseStudies, getCaseStudy, getService, translationSlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, caseStudyJsonLd } from "@/lib/seo/jsonld";
import { routes, serviceHref } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Prose } from "@/components/ui/Prose";
import { Picture } from "@/components/ui/Picture";
import { MetricGrid } from "@/components/ui/Metric";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Mdx } from "@/components/mdx/Mdx";
import { CtaBand } from "@/components/sections/CtaBand";

type Params = { locale: Locale; slug: string };

export function generateStaticParams(): Params[] {
  return locales.flatMap((locale) =>
    getCaseStudies(locale).map((doc) => ({ locale, slug: doc.data.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = getCaseStudy(locale, slug);
  if (!doc) return {};

  const other = otherLocale(locale);
  const otherSlug = translationSlug("portfolio", doc.data.translationKey, other);

  return buildMetadata({
    locale,
    path: `${routes.portfolio}/${slug}`,
    title: doc.data.title,
    metaTitle: doc.data.metaTitle,
    description: doc.data.metaDescription,
    type: "article",
    modifiedTime: doc.data.updatedAt,
    alternates: {
      [locale]: `${routes.portfolio}/${slug}`,
      ...(otherSlug ? { [other]: `${routes.portfolio}/${otherSlug}` } : {}),
    },
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const doc = getCaseStudy(locale, slug);
  if (!doc) notFound();

  const dict = getDictionary(locale);
  const { data } = doc;
  const service = getService(locale, data.service);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.portfolio, path: routes.portfolio },
    { name: data.title, path: `${routes.portfolio}/${slug}` },
  ];

  const metricLabels = {
    before: dict.common.before,
    after: dict.common.after,
    improvement: dict.common.improvement,
  };

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="measure text-3xl text-balance">{data.title}</h1>

        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-border py-6 sm:grid-cols-4 sm:gap-6">
          <div>
            <dt className="text-xs text-subtle">{dict.common.client}</dt>
            <dd className="mt-1 text-sm font-medium">
              {data.clientAnonymous ? dict.common.confidential : data.client}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">{dict.common.industry}</dt>
            <dd className="mt-1 text-sm font-medium">{data.industry}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">{dict.common.year}</dt>
            <dd className="nums mt-1 text-sm font-medium">
              {formatNumber(data.year, locale, { useGrouping: false })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">{dict.common.relatedService}</dt>
            <dd className="mt-1 text-sm font-medium">
              {service ? (
                <Link href={serviceHref(locale, service.data.slug)} className="text-accent-text">
                  {service.data.navLabel}
                </Link>
              ) : (
                data.service
              )}
            </dd>
          </div>
        </dl>

        <ul className="mt-6 flex flex-wrap gap-2">
          {data.stack.map((item) => (
            <li key={item}>
              <Badge>
                <span dir="ltr">{item}</span>
              </Badge>
            </li>
          ))}
        </ul>

        <div className="mt-10 overflow-hidden rounded-(--radius-lg) border border-border">
          <Picture
            src={data.cover}
            alt={data.coverAlt ?? data.title}
            priority
            sizes="(min-width: 1152px) 1088px, 100vw"
          />
        </div>
      </Container>

      <Section size="narrow" title={dict.portfolio.problemTitle}>
        <p className="measure text-lg">{data.problem}</p>
      </Section>

      <Section size="narrow" title={dict.portfolio.solutionTitle} tone="sunk">
        <Prose>
          <Mdx source={doc.body} />
        </Prose>
      </Section>

      <Section title={dict.portfolio.resultTitle} lead={dict.portfolio.metricsCaption}>
        <MetricGrid metrics={data.metrics} locale={locale} labels={metricLabels} />

        {data.testimonial && (
          <figure className="measure mt-10 border-s-3 border-accent ps-5">
            <blockquote className="text-lg">{data.testimonial.quote}</blockquote>
            <figcaption className="mt-3 text-sm text-muted">
              {data.testimonial.author} — {data.testimonial.role}
            </figcaption>
          </figure>
        )}

        {data.liveUrl && (
          <p className="mt-8">
            <ButtonLink href={data.liveUrl} variant="secondary">
              {dict.common.liveSite}
            </ButtonLink>
          </p>
        )}
      </Section>

      {service && (
        <CtaBand
          locale={locale}
          title={service.data.h1}
          body={service.data.summary}
          cta={dict.common.startProject}
        />
      )}

      <JsonLd data={[caseStudyJsonLd(locale, data), breadcrumbJsonLd(locale, crumbs)]} />
    </>
  );
}
