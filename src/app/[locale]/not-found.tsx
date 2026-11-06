import { defaultLocale } from "@/lib/i18n/config";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

/**
 * The not-found boundary cannot read route params, so it renders in the
 * default locale.
 */
export default function NotFound() {
  return <NotFoundContent locale={defaultLocale} />;
}
