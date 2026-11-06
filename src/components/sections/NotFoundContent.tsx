import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { headerNav, routeHref } from "@/lib/seo/routes";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Shared by the not-found boundary and the statically exported /404 route. */
export function NotFoundContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <Container size="narrow" className="py-24">
      <p className="nums text-sm font-medium text-accent-text">404</p>
      <h1 className="mt-3 text-3xl">{dict.notFound.h1}</h1>
      <p className="measure mt-4 text-lg text-muted">{dict.notFound.body}</p>

      <ul className="mt-8 flex flex-wrap gap-3">
        {headerNav.map((key) => (
          <li key={key}>
            <Link
              href={routeHref(locale, key)}
              className="inline-flex rounded-(--radius-md) border border-border px-4 py-2 text-sm font-medium no-underline transition-colors duration-(--dur) hover:border-accent hover:text-accent-text"
            >
              {dict.nav[key]}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10">
        <ButtonLink href={routeHref(locale, "home")}>{dict.notFound.home}</ButtonLink>
      </p>
    </Container>
  );
}
