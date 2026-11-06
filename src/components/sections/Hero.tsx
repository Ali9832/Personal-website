import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { routeHref } from "@/lib/seo/routes";

const STACK = [
  "WordPress",
  "WooCommerce",
  "PHP",
  "Next.js",
  "React",
  "TypeScript",
  "Python",
  "MySQL",
  "PostgreSQL",
];

export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="border-b border-border pt-16 pb-14 sm:pt-24 sm:pb-20">
      <Container>
        <p className="text-sm font-medium tracking-wide text-accent-text">
          {dict.home.eyebrow}
        </p>

        {/* The single h1 on the home page. */}
        <h1 className="mt-4 max-w-[18ch] text-4xl text-balance">{dict.home.h1}</h1>

        <p className="measure mt-6 text-lg text-muted">{dict.home.lead}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <ButtonLink href={routeHref(locale, "contact")} size="lg">
            {dict.home.primaryCta}
          </ButtonLink>
          <ButtonLink href={routeHref(locale, "portfolio")} size="lg" variant="secondary">
            {dict.home.secondaryCta}
          </ButtonLink>
        </div>

        <div className="mt-14">
          <h2 className="text-xs font-medium tracking-wide text-subtle uppercase">
            {dict.home.stackLabel}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {STACK.map((item) => (
              <li key={item} className="text-sm font-medium text-muted" dir="ltr">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
