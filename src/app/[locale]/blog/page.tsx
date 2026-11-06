import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PostGrid } from "@/components/sections/PostCard";

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
    path: routes.blog,
    title: dict.blog.title,
    description: dict.blog.description,
    alternates: { fa: routes.blog, en: routes.blog },
  });
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const docs = getPosts(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.blog, path: routes.blog },
  ];

  return (
    <>
      <Container className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="text-3xl">{dict.blog.h1}</h1>
        <p className="measure mt-4 text-lg text-muted">{dict.blog.lead}</p>
      </Container>

      <Section>
        {docs.length > 0 ? (
          <PostGrid docs={docs} locale={locale} />
        ) : (
          <p className="text-muted">{dict.common.empty}</p>
        )}
      </Section>

      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
    </>
  );
}
