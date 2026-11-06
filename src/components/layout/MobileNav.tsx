"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { key: string; label: string; href: string };

/**
 * The only stateful piece of chrome on the site. It renders nothing until
 * opened, closes on route change and on Escape, and moves focus into the
 * panel so keyboard users are not left behind the trigger.
 */
export function MobileNav({
  items,
  openLabel,
  closeLabel,
  navLabel,
}: {
  items: Item[];
  openLabel: string;
  closeLabel: string;
  navLabel: string;
}) {
  const pathname = usePathname();
  // The panel is "open for this path". Navigating changes the path, which
  // closes it as a consequence of rendering — no effect needed to reset it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFor(null);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpenFor(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeLabel : openLabel}
        className="inline-flex size-9 items-center justify-center rounded-(--radius-md) border border-border text-muted transition-colors duration-(--dur) hover:border-border-strong hover:text-text"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="absolute inset-x-0 top-16 border-b border-border bg-bg shadow-(--shadow-md)"
        >
          <nav aria-label={navLabel} className="mx-auto max-w-(--container) px-(--gutter) py-3">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="block border-b border-border py-3 text-base font-medium no-underline last:border-b-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
