import { type Locale } from "@/lib/i18n/config";
import { type ServiceDoc } from "@/lib/content";
import { Card, CardLink } from "@/components/ui/Card";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { serviceHref } from "@/lib/seo/routes";

export function ServiceGrid({
  services,
  locale,
}: {
  services: ServiceDoc[];
  locale: Locale;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map(({ data }) => (
        <Card as="li" key={data.slug} className="p-6">
          <span className="text-accent">
            <ServiceIcon name={data.icon} />
          </span>
          <h3 className="mt-4 text-lg font-bold">
            <CardLink href={serviceHref(locale, data.slug)}>{data.h1}</CardLink>
          </h3>
          <p className="mt-2 text-sm text-muted">{data.summary}</p>
        </Card>
      ))}
    </ul>
  );
}
