import { type Metadata } from "next";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { site } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { routes } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "./ContactForm";

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
    path: routes.contact,
    title: dict.contact.title,
    description: dict.contact.description,
    alternates: { fa: routes.contact, en: routes.contact },
  });
}

export default async function ContactPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const crumbs = [
    { name: dict.nav.home, path: routes.home },
    { name: dict.nav.contact, path: routes.contact },
  ];

  const direct = [
    { label: dict.footer.email, href: `mailto:${site.author.email}`, value: site.author.email },
    { label: dict.footer.telegram, href: site.author.telegram, value: "@alifatehi" },
  ];

  return (
    <>
      <Container className="py-10">
        <Breadcrumbs locale={locale} crumbs={crumbs} />
        <h1 className="text-3xl">{dict.contact.h1}</h1>
        <p className="measure mt-4 text-lg text-muted">{dict.contact.lead}</p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <ContactForm locale={locale} dict={dict.contact} />

          <aside className="space-y-8">
            <div className="rounded-(--radius-lg) border border-border bg-surface-sunk p-5">
              <p className="text-sm text-muted">{dict.contact.responseTime}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold">{dict.contact.directTitle}</h2>
              <ul className="mt-3 space-y-3">
                {direct.map((item) => (
                  <li key={item.label}>
                    <span className="block text-xs text-subtle">{item.label}</span>
                    <a
                      href={item.href}
                      dir="ltr"
                      className="text-sm text-accent-text"
                      rel="noopener noreferrer"
                    >
                      {item.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />
    </>
  );
}
