import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
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
    path: routes.services,
    title: dict.services.title,
    description: dict.services.description,
    alternates: { fa: routes.services, en: routes.services },
  });
}

export default async function ServicesPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const services = getServices(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.services, path: routes.services },
  ];

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="text-3xl">{dict.services.h1}</h1>
        <p className="measure mt-4 text-lg text-muted">{dict.services.lead}</p>
      </Container>

      <Section>
        <ServiceGrid services={services} locale={locale} />
      </Section>

      <CtaBand
        locale={locale}
        title={dict.services.ctaTitle}
        body={dict.services.ctaBody}
        cta={dict.common.getInTouch}
      />

      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
    </>
  );
}
