import { type Locale } from "@/lib/i18n/config";
import { formatMetricValue, formatNumber, improvement, signedChange } from "@/lib/i18n/format";
import { type Metric } from "@/lib/content/schemas";
import { cn } from "@/lib/utils/cn";

/**
 * A metric is shown as two bars rather than "4.2 → 1.1" with an arrow: bars
 * use inline-size, so the visual direction follows the document without a
 * single mirrored glyph, and the size of the win is legible before the
 * numbers are read.
 */
export function MetricCard({
  metric,
  locale,
  labels,
  className,
}: {
  metric: Metric;
  locale: Locale;
  labels: { before: string; after: string; improvement: string };
  className?: string;
}) {
  const { before } = metric;

  // Delivered-scope figure: no baseline, so no bars and no percentage.
  if (before === undefined) {
    return (
      <div
        className={cn(
          "rounded-(--radius-lg) border border-border bg-surface p-5",
          className,
        )}
      >
        <p className="text-sm font-medium text-muted">{metric.label}</p>
        <p className="nums mt-3 text-2xl font-bold text-text">
          {formatMetricValue(metric.after, metric.unit, locale)}
        </p>
      </div>
    );
  }

  // Two different numbers: `delta` says whether this is good news, `change`
  // is the actual movement in the value and is what gets printed.
  const delta = improvement(before, metric.after, metric.direction);
  const change = signedChange(before, metric.after);
  const max = Math.max(before, metric.after, 0.0001);
  const beforePct = (before / max) * 100;
  const afterPct = (metric.after / max) * 100;

  return (
    <div
      className={cn(
        "rounded-(--radius-lg) border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{metric.label}</p>
        {/* dir="ltr" so the sign stays attached to the left of the number
            inside an RTL paragraph, where bidi would otherwise move it. */}
        <span
          dir="ltr"
          className={cn(
            "nums shrink-0 rounded-(--radius-full) px-2 py-0.5 text-xs font-semibold",
            delta > 0
              ? "bg-accent-wash text-accent-text"
              : "bg-surface-sunk text-subtle",
          )}
          aria-label={`${labels.improvement}: ${sign(change)}${formatNumber(Math.abs(change), locale)}%`}
        >
          {sign(change)}
          {formatNumber(Math.abs(change), locale)}%
        </span>
      </div>

      <p className="nums mt-3 text-2xl font-bold text-text">
        {formatMetricValue(metric.after, metric.unit, locale)}
      </p>

      <div className="mt-4 space-y-2">
        <Bar
          label={labels.before}
          value={formatMetricValue(before, metric.unit, locale)}
          percent={beforePct}
          tone="muted"
        />
        <Bar
          label={labels.after}
          value={formatMetricValue(metric.after, metric.unit, locale)}
          percent={afterPct}
          tone="accent"
        />
      </div>
    </div>
  );
}

/** No sign for an unchanged value: "−0%" reads as a regression. */
function sign(change: number): string {
  return change > 0 ? "+" : change < 0 ? "−" : "";
}

function Bar({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: "muted" | "accent";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-2xs text-subtle">{label}</span>
      <span
        className="h-2 flex-1 overflow-hidden rounded-(--radius-full) bg-surface-sunk"
        aria-hidden="true"
      >
        <span
          className={cn(
            "block h-full rounded-(--radius-full)",
            tone === "accent" ? "bg-accent" : "bg-border-strong",
          )}
          style={{ inlineSize: `${Math.max(3, Math.min(100, percent))}%` }}
        />
      </span>
      <span className="nums w-24 shrink-0 text-2xs text-muted">{value}</span>
    </div>
  );
}

export function MetricGrid({
  metrics,
  locale,
  labels,
}: {
  metrics: Metric[];
  locale: Locale;
  labels: { before: string; after: string; improvement: string };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} locale={locale} labels={labels} />
      ))}
    </div>
  );
}
