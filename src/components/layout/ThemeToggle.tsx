"use client";

import { useCallback } from "react";

/**
 * Which icon is visible is decided in CSS from the `data-theme` attribute and
 * `prefers-color-scheme`, not from React state — so the correct icon is in
 * the very first paint and there is no hydration mismatch to reconcile.
 */
export function ThemeToggle({ label }: { label: string }) {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const explicit = root.getAttribute("data-theme");
    const current =
      explicit ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode / blocked storage: the toggle still works for this page.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-(--radius-md) border border-border text-muted transition-colors duration-(--dur) hover:border-border-strong hover:text-text"
    >
      <svg
        className="theme-icon-light size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </svg>
      <svg
        className="theme-icon-dark size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z" />
      </svg>
    </button>
  );
}
