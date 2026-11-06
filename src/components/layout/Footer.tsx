import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getServices } from "@/lib/content";
import { site } from "@/lib/site";
import { href, navOrder, routeHref, serviceHref } from "@/lib/seo/routes";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const services = getServices(locale).slice(0, 6);
  const year = new Date().getFullYear();

  const social = [
    { label: dict.footer.email, href: `mailto:${site.author.email}` },
    { label: dict.footer.telegram, href: site.author.telegram },
    { label: dict.footer.github, href: site.author.github },
    { label: dict.footer.linkedin, href: site.author.linkedin },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-surface-sunk">
      <div className="mx-auto w-full max-w-(--container) px-(--gutter) py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="measure-narrow">
            <p className="text-base font-bold">{dict.meta.siteName}</p>
            <p className="mt-2 text-sm text-muted">{dict.footer.tagline}</p>
          </div>

          <nav aria-label={dict.nav.footerNavigation}>
            <h2 className="text-sm font-semibold">{dict.footer.sitemap}</h2>
            <ul className="mt-3 space-y-2">
              {navOrder.map((key) => (
                <li key={key}>
                  <Link
                    href={routeHref(locale, key)}
                    className="text-sm text-muted no-underline transition-colors duration-(--dur) hover:text-accent-text"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">{dict.footer.servicesTitle}</h2>
            <ul className="mt-3 space-y-2">
              {services.map((doc) => (
                <li key={doc.data.slug}>
                  <Link
                    href={serviceHref(locale, doc.data.slug)}
                    className="text-sm text-muted no-underline transition-colors duration-(--dur) hover:text-accent-text"
                  >
                    {doc.data.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{dict.footer.elsewhere}</h2>
            <ul className="mt-3 space-y-2">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    rel="me noopener noreferrer"
                    className="text-sm text-muted no-underline transition-colors duration-(--dur) hover:text-accent-text"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p className="nums">
            © {year} {dict.meta.siteName}. {dict.footer.rights}
          </p>
          <p>
            <Link href={href(locale)} className="no-underline hover:text-accent-text">
              {dict.footer.builtWith}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
