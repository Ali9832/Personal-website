import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getFeaturedCaseStudies, getPosts, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { routeHref, routes } from "@/lib/seo/routes";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/sections/Hero";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { WorkGrid } from "@/components/sections/WorkCard";
import { PostGrid } from "@/components/sections/PostCard";
import { StepList } from "@/components/sections/StepList";
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
    path: routes.home,
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { fa: routes.home, en: routes.home },
  });
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const services = getServices(locale);
  const work = getFeaturedCaseStudies(locale, 3);
  const posts = getPosts(locale).slice(0, 3);

  return (
    <>
      <Hero locale={locale} />

      <Section
        title={dict.home.servicesTitle}
        lead={dict.home.servicesLead}
        action={
          <ButtonLink href={routeHref(locale, "services")} variant="secondary">
            {dict.common.viewAllServices}
          </ButtonLink>
        }
      >
        <ServiceGrid services={services} locale={locale} />
      </Section>

      {work.length > 0 && (
        <Section
          tone="sunk"
          title={dict.home.workTitle}
          lead={dict.home.workLead}
          action={
            <ButtonLink href={routeHref(locale, "portfolio")} variant="secondary">
              {dict.common.viewAllWork}
            </ButtonLink>
          }
        >
          <WorkGrid docs={work} locale={locale} />
        </Section>
      )}

      <Section title={dict.home.approachTitle} lead={dict.home.approachLead}>
        <StepList steps={dict.home.approach} locale={locale} />
      </Section>

      {posts.length > 0 && (
        <Section
          tone="sunk"
          title={dict.home.blogTitle}
          lead={dict.home.blogLead}
          action={
            <ButtonLink href={routeHref(locale, "blog")} variant="secondary">
              {dict.common.viewAllPosts}
            </ButtonLink>
          }
        >
          <PostGrid docs={posts} locale={locale} />
        </Section>
      )}

      <CtaBand
        locale={locale}
        title={dict.home.ctaTitle}
        body={dict.home.ctaBody}
        cta={dict.home.ctaButton}
      />
    </>
  );
}
