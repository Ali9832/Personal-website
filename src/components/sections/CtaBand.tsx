import { type Locale } from "@/lib/i18n/config";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { routeHref } from "@/lib/seo/routes";

export function CtaBand({
  locale,
  title,
  body,
  cta,
}: {
  locale: Locale;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <section className="border-t border-border bg-surface-sunk py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="measure">
            <h2 className="text-2xl text-balance">{title}</h2>
            <p className="mt-3 text-muted">{body}</p>
          </div>
          <ButtonLink href={routeHref(locale, "contact")} size="lg" className="self-start">
            {cta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
