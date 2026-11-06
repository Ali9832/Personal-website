import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getCaseStudies } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkGrid } from "@/components/sections/WorkCard";
import { CtaBand } from "@/components/sections/CtaBand";

type Params = { locale: Locale };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: routes.portfolio,
    title: dict.portfolio.title,
    description: dict.portfolio.description,
    alternates: { fa: routes.portfolio, en: routes.portfolio },
  });
}

export default async function PortfolioPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const docs = getCaseStudies(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.portfolio, path: routes.portfolio },
  ];

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="text-3xl">{dict.portfolio.h1}</h1>
        <p className="measure mt-4 text-lg text-muted">{dict.portfolio.lead}</p>
      </Container>

      <Section>
        {docs.length > 0 ? (
          <WorkGrid docs={docs} locale={locale} />
        ) : (
          <p className="text-muted">{dict.common.empty}</p>
        )}
      </Section>

      <CtaBand
        locale={locale}
        title={dict.home.ctaTitle}
        body={dict.home.ctaBody}
        cta={dict.common.startProject}
      />

      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
    </>
  );
}
