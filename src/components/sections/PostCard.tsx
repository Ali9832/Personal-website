import { type Locale } from "@/lib/i18n/config";
import { formatDate, isoDate, readingTimeLabel } from "@/lib/i18n/format";
import { type PostDoc } from "@/lib/content";
import { Card, CardLink } from "@/components/ui/Card";
import { postHref } from "@/lib/seo/routes";

export function PostCard({ doc, locale }: { doc: PostDoc; locale: Locale }) {
  const { data } = doc;
  return (
    <Card as="li" className="p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
        <time dateTime={isoDate(data.publishedAt)} className="nums">
          {formatDate(data.publishedAt, locale)}
        </time>
        <span aria-hidden="true">·</span>
        <span className="nums">{readingTimeLabel(doc.readingTimeMinutes, locale)}</span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-balance">
        <CardLink href={postHref(locale, data.slug)}>{data.title}</CardLink>
      </h3>

      <p className="mt-2 text-sm text-muted">{data.description}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {data.tags.map((tag) => (
          <li key={tag} className="text-xs text-subtle">
            #{tag}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function PostGrid({ docs, locale }: { docs: PostDoc[]; locale: Locale }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <PostCard key={doc.data.slug} doc={doc} locale={locale} />
      ))}
    </ul>
  );
}
