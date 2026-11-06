import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBand } from "@/components/sections/CtaBand";
import { Picture } from "@/components/ui/Picture";

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
    path: routes.about,
    title: dict.about.title,
    description: dict.about.description,
    type: "profile",
    alternates: { fa: routes.about, en: routes.about },
  });
}

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.about, path: routes.about },
  ];

  return (
    <>
      <Container size="narrow" className="pt-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="text-3xl">{dict.about.h1}</h1>
        <p className="mt-4 text-lg text-muted">{dict.about.lead}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(180px,240px)_1fr] sm:items-center">
          <Picture
            src="/media/profile-ali-fatehi.webp"
            alt={locale === "fa" ? "علی فاتحی، توسعه‌دهنده وب" : "Ali Fatehi, web developer"}
            width={928}
            height={1152}
            sizes="(min-width: 640px) 240px, 70vw"
            priority
            className="mx-auto aspect-[4/5] max-w-[240px] rounded-2xl object-cover object-top shadow-sm"
          />
          <p className="measure text-sm leading-7 text-muted">
            {locale === "fa"
              ? "این سایت را خودم طراحی و توسعه داده‌ام؛ از معماری محتوا و تجربه کاربری تا پیاده‌سازی و بهینه‌سازی سرعت."
              : "I designed and built this website myself — from content architecture and UX to implementation and performance optimisation."}
          </p>
        </div>

        <div className="measure mt-8 space-y-5">
          {dict.about.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </Container>

      <Section tone="sunk" title={dict.about.skillsTitle} className="mt-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dict.about.skills.map((group) => (
            <div key={group.title}>
              <h3 className="text-base font-bold">{group.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        locale={locale}
        title={dict.about.ctaTitle}
        body={dict.about.ctaBody}
        cta={dict.common.getInTouch}
      />

      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
    </>
  );
}
