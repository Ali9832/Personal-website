import Link from "next/link";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { href } from "@/lib/seo/routes";
import { type Crumb } from "@/lib/seo/jsonld";

/**
 * Visual breadcrumbs. The matching BreadcrumbList JSON-LD is emitted by the
 * page from the same array, so the two can never disagree.
 */
export function Breadcrumbs({ locale, crumbs }: { locale: Locale; crumbs: Crumb[] }) {
  const dict = getDictionary(locale);
  return (
    <nav aria-label={dict.nav.breadcrumb} className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-x-2">
              {isLast ? (
                <span aria-current="page" className="text-muted">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={href(locale, crumb.path)}
                  className="no-underline transition-colors duration-(--dur) hover:text-accent-text"
                >
                  {crumb.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
