import { z } from "zod";
import { locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { type Locale } from "@/lib/i18n/config";

/**
 * Built per locale so the same rules produce messages in the visitor's
 * language — the client and the server validate against one definition.
 */
export function contactSchema(locale: Locale) {
  const m = getDictionary(locale).contact.validation;

  return z.object({
    name: z.string().trim().min(2, m.nameMin).max(80, m.nameMax),
    email: z.string().trim().email(m.emailInvalid).max(160),
    subject: z.string().trim().min(3, m.subjectMin).max(140),
    budget: z.string().trim().max(60).optional().or(z.literal("")),
    message: z.string().trim().min(30, m.messageMin).max(5000, m.messageMax),
    locale: z.enum(locales),
    /**
     * Honeypot. Deliberately NOT constrained here: a schema error would name
     * the field in the response and tell a bot exactly what caught it. The
     * handler checks it separately and reports success either way.
     */
    website: z.string().max(200).optional(),
    /** Render timestamp, used by the time trap. */
    renderedAt: z.coerce.number().int().nonnegative().optional(),
  });
}

export type ContactInput = z.infer<ReturnType<typeof contactSchema>>;

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

/** What a handler can return — never the form's initial state. */
export type ContactResponse =
  | { status: "success" }
  | { status: "error"; reason: "validation"; fields: ContactFieldErrors }
  | { status: "error"; reason: "rate-limited" | "server" };

/** Adds the initial state the client form starts in. */
export type ContactResult = { status: "idle" } | ContactResponse;
