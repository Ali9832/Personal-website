import "server-only";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getNotifiers } from "@/lib/notify";
import { clientKey, rateLimit } from "./rate-limit";
import { allowedContactOrigin } from "./request";
import { contactSchema, type ContactFieldErrors, type ContactResponse } from "./schema";

/** Submissions faster than this are not human. */
const MIN_FILL_MS = 3000;

/**
 * One handler, two entry points: the API route and the server action both
 * call this, so the rules cannot diverge between the JS and no-JS paths.
 */
export async function handleContact(
  form: Record<string, string>,
  headers: Headers,
): Promise<ContactResponse> {
  if (!allowedContactOrigin(headers)) return { status: "error", reason: "server" };
  const localeValue = form.locale;
  const locale: Locale = isLocale(localeValue) ? localeValue : "fa";

  const key = clientKey(headers);
  if (!rateLimit(key, { record: false }).allowed) {
    return { status: "error", reason: "rate-limited" };
  }

  const parsed = contactSchema(locale).safeParse(form);
  if (!parsed.success) {
    const fields: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fields)) {
        fields[key as keyof ContactFieldErrors] = issue.message;
      }
    }
    return { status: "error", reason: "validation", fields };
  }

  const data = parsed.data;

  // Only a submission that is going to be delivered consumes a slot.
  if (!rateLimit(key).allowed) return { status: "error", reason: "rate-limited" };

  // Honeypot and time trap. Both report success: a bot shown an error retries
  // with a different shape, a bot shown success moves on. Neither response
  // reveals which check caught it.
  if (data.website) return { status: "success" };
  if (data.renderedAt && Date.now() - data.renderedAt < MIN_FILL_MS) {
    return { status: "success" };
  }

  const notifiers = getNotifiers();
  if (notifiers.length === 0) {
    console.error("[contact] no notifier configured — message dropped");
    return { status: "error", reason: "server" };
  }

  const results = await Promise.allSettled(
    notifiers.map((notifier) =>
      notifier.send({
        name: data.name,
        email: data.email,
        subject: data.subject,
        budget: data.budget || undefined,
        message: data.message,
        locale,
        receivedAt: new Date(),
        userAgent: headers.get("user-agent") ?? undefined,
      }),
    ),
  );

  const delivered = results.some((r) => r.status === "fulfilled");
  for (const result of results) {
    if (result.status === "rejected") console.error("[contact]", result.reason);
  }

  return delivered ? { status: "success" } : { status: "error", reason: "server" };
}
