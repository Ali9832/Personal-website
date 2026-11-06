import { type Faq as FaqItem } from "@/lib/content/schemas";

/**
 * Native <details>/<summary>: keyboard operable, screen-reader correct,
 * findable with the browser's own in-page search, and zero JavaScript.
 * Every accordion library reimplements this worse.
 */
export function Faq({ items, title, id }: { items: FaqItem[]; title: string; id?: string }) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="measure">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-6 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold marker:content-none">
              <svg
                viewBox="0 0 24 24"
                className="mt-1.5 size-3.5 shrink-0 text-accent transition-transform duration-(--dur) group-open:rotate-45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{item.q}</span>
            </summary>
            <p className="mt-3 ps-6.5 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
