import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/routes";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { routeHref } from "@/lib/seo/routes";

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
    path: routes.products,
    title: dict.products.title,
    description: dict.products.description,
    alternates: { fa: routes.products, en: routes.products },
    // Phase-2 skeleton: crawlable (so the noindex is actually read) but kept
    // out of the index and out of the sitemap until it has real products.
    noIndex: true,
  });
}

export default async function ProductsPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.products, path: routes.products },
  ];

  return (
    <Container size="narrow" className="py-10">
      <Breadcrumbs locale={locale} crumbs={crumbs} />
      <h1 className="text-3xl">{dict.products.h1}</h1>
      <p className="measure mt-4 text-lg text-muted">{dict.products.lead}</p>

      <div className="mt-12 rounded-(--radius-lg) border border-dashed border-border-strong p-8">
        <h2 className="text-lg font-bold">{dict.products.soonTitle}</h2>
        <p className="measure mt-3 text-muted">{dict.products.soonBody}</p>
        <p className="mt-6">
          <ButtonLink href={routeHref(locale, "contact")}>{dict.products.soonCta}</ButtonLink>
        </p>
      </div>
    </Container>
  );
}
