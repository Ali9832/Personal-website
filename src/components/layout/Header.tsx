import Link from "next/link";
import { otherLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { headerNav, href, routeHref, routes } from "@/lib/seo/routes";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const other = otherLocale(locale);
  const items = headerNav.map((key) => ({
    key,
    label: dict.nav[key],
    href: routeHref(locale, key),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-(--container) items-center gap-4 px-(--gutter)">
        <Link
          href={href(locale)}
          className="shrink-0 text-base font-bold tracking-tight no-underline"
        >
          {dict.meta.siteName}
          <span className="ms-2 inline-block size-1.5 rounded-(--radius-full) bg-accent align-middle" />
        </Link>

        <nav
          aria-label={dict.nav.mainNavigation}
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="rounded-(--radius-md) px-3 py-2 text-sm font-medium text-muted no-underline transition-colors duration-(--dur) hover:bg-surface-sunk hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <ThemeToggle label={dict.theme.toggle} />
          <LocaleSwitch
            target={other}
            label={dict.langSwitch.label}
            fallbackHref={href(other, routes.home)}
          />
          <MobileNav
            items={items}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
            navLabel={dict.nav.mainNavigation}
          />
        </div>
      </div>
    </header>
  );
}
