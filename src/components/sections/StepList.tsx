import { type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";

/** Numbered process steps — used by the home page and every service page. */
export function StepList({
  steps,
  locale,
}: {
  steps: ReadonlyArray<{ title: string; body: string }>;
  locale: Locale;
}) {
  return (
    <ol className="grid gap-8 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="nums inline-flex size-8 items-center justify-center rounded-(--radius-full) border border-accent-border bg-accent-wash text-sm font-bold text-accent-text">
            {formatNumber(index + 1, locale)}
          </span>
          <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
          <p className="mt-2 text-sm text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
