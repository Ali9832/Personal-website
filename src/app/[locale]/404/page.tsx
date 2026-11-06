import { type Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

/**
 * A real, statically exported page — Apache's ErrorDocument needs a file it
 * can serve, and a not-found *boundary* produces no file under
 * `output: "export"`. One per locale, so an English URL does not 404 in
 * Persian.
 *
 * It is noindex and absent from the sitemap; the only thing that ever links
 * here is the web server, with a 404 status attached.
 */
type Params = { locale: Locale };

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "/404",
    title: dict.notFound.title,
    description: dict.notFound.body,
    noIndex: true,
  });
}

export default async function NotFoundPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  return <NotFoundContent locale={locale} />;
}
