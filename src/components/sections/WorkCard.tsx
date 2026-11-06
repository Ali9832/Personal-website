import { type Locale } from "@/lib/i18n/config";
import { formatMetricValue, formatNumber, signedChange } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { type CaseStudyDoc } from "@/lib/content";
import { Card, CardLink } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Picture } from "@/components/ui/Picture";
import { caseStudyHref } from "@/lib/seo/routes";
import { ButtonLink } from "@/components/ui/Button";

export function WorkCard({
  doc,
  locale,
  priority = false,
}: {
  doc: CaseStudyDoc;
  locale: Locale;
  priority?: boolean;
}) {
  const dict = getDictionary(locale);
  const { data } = doc;
  // Lead with a real before/after if the study has one; scope figures are
  // weaker evidence and should not be the first number a visitor reads.
  const headline = data.metrics.find((m) => m.before !== undefined) ?? data.metrics[0];
  const change =
    headline?.before !== undefined ? signedChange(headline.before, headline.after) : 0;

  return (
    <Card as="li" className="overflow-hidden">
      <Picture
        src={data.cover}
        alt=""
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        priority={priority}
        className="aspect-16/10 border-b border-border object-cover"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{data.industry}</Badge>
          <Badge className="nums">{formatNumber(data.year, locale, { useGrouping: false })}</Badge>
        </div>

        <h3 className="mt-3 text-lg font-bold text-balance">
          <CardLink href={caseStudyHref(locale, data.slug)}>{data.title}</CardLink>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm text-muted">{data.problem}</p>

        {headline && (
          <dl className="mt-5 flex items-baseline gap-2 border-t border-border pt-4">
            <dt className="text-xs text-subtle">{headline.label}</dt>
            <dd className="nums ms-auto text-sm font-semibold text-accent-text">
              {headline.before !== undefined && (
                <>
                  {formatMetricValue(headline.before, headline.unit, locale)}
                  <span className="mx-1.5 text-subtle" aria-hidden="true">
                    ·
                  </span>
                </>
              )}
              {formatMetricValue(headline.after, headline.unit, locale)}
              {change !== 0 && (
                <span dir="ltr" className="ms-2 text-xs font-normal text-muted">
                  ({change > 0 ? "+" : "−"}
                  {formatNumber(Math.abs(change), locale)}%)
                </span>
              )}
            </dd>
          </dl>
        )}

        {data.liveUrl && (
          <ButtonLink
            href={data.liveUrl}
            variant="secondary"
            size="md"
            className="relative z-10 mt-5 self-start"
          >
            {dict.common.liveSite}
          </ButtonLink>
        )}

        <p className="sr-only">{dict.common.viewCaseStudy}</p>
      </div>
    </Card>
  );
}

export function WorkGrid({ docs, locale }: { docs: CaseStudyDoc[]; locale: Locale }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc, index) => (
        <WorkCard key={doc.data.slug} doc={doc} locale={locale} priority={index === 0} />
      ))}
    </ul>
  );
}
