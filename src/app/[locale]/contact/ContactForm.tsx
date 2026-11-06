"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { type Locale } from "@/lib/i18n/config";
import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type ContactResult } from "@/lib/contact/schema";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/**
 * The form posts to the Next.js API route. It also remains a real HTML form
 * so it degrades gracefully when JavaScript is disabled.
 *
 * It degrades properly: the element is a real <form method="POST"> with a
 * real action, so with JavaScript disabled the browser submits it natively
 * and PHP renders its own confirmation page. The handler below only
 * intercepts that submit to keep the visitor on the page.
 */
const ENDPOINT = "/api/contact/"; // trailingSlash: true would 308 the bare path

export function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["contact"];
}) {
  const id = useId();
  const [state, setState] = useState<ContactResult>({ status: "idle" });
  const [pending, setPending] = useState(false);

  // Stamped on mount rather than read during render: the server rejects
  // anything submitted in under three seconds, and calling the clock while
  // rendering is impure. Without JavaScript the field stays empty and the
  // check is simply skipped.
  const renderedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (renderedAt.current) renderedAt.current.value = String(Date.now());
  }, []);

  const fieldError = (name: string): string | undefined =>
    state.status === "error" && state.reason === "validation"
      ? (state.fields as Record<string, string | undefined>)[name]
      : undefined;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const result = (await response.json()) as ContactResult;
      setState(result);
      if (result.status === "success") form.reset();
    } catch {
      setState({ status: "error", reason: "server" });
    } finally {
      setPending(false);
    }
  }

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-(--radius-lg) border border-accent-border bg-accent-wash p-6"
      >
        <h2 className="text-lg font-bold">{dict.form.successTitle}</h2>
        <p className="mt-2 text-muted">{dict.form.successBody}</p>
        <p className="mt-4">
          <Button type="button" variant="secondary" onClick={() => setState({ status: "idle" })}>
            {dict.form.sendAnother}
          </Button>
        </p>
      </div>
    );
  }

  return (
    <form method="POST" action={ENDPOINT} onSubmit={onSubmit} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input ref={renderedAt} type="hidden" name="renderedAt" defaultValue="" />

      {/* Honeypot: off-screen rather than display:none, so bots that check
          computed styles still fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${id}-website`}>{dict.form.honeypotLabel}</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field
        id={`${id}-name`}
        name="name"
        label={dict.form.name}
        placeholder={dict.form.namePlaceholder}
        autoComplete="name"
        required
        requiredLabel={dict.form.required}
        error={fieldError("name")}
      />

      <Field
        id={`${id}-email`}
        name="email"
        type="email"
        dir="ltr"
        label={dict.form.email}
        placeholder={dict.form.emailPlaceholder}
        autoComplete="email"
        required
        requiredLabel={dict.form.required}
        error={fieldError("email")}
      />

      <Field
        id={`${id}-subject`}
        name="subject"
        label={dict.form.subject}
        placeholder={dict.form.subjectPlaceholder}
        required
        requiredLabel={dict.form.required}
        error={fieldError("subject")}
      />

      <div>
        <Label htmlFor={`${id}-budget`} hint={dict.form.optional}>
          {dict.form.budget}
        </Label>
        <select
          id={`${id}-budget`}
          name="budget"
          defaultValue=""
          className="mt-2 w-full rounded-(--radius-md) border border-border bg-surface px-3 py-2.5 text-base"
        >
          <option value="">{dict.form.budgetPlaceholder}</option>
          {dict.form.budgetOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`${id}-message`} hint={dict.form.required}>
          {dict.form.message}
        </Label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={7}
          required
          placeholder={dict.form.messagePlaceholder}
          aria-invalid={Boolean(fieldError("message"))}
          aria-describedby={fieldError("message") ? `${id}-message-error` : undefined}
          className={cn(
            "mt-2 w-full resize-y rounded-(--radius-md) border bg-surface px-3 py-2.5 text-base",
            fieldError("message") ? "border-negative" : "border-border",
          )}
        />
        <FieldError id={`${id}-message-error`} message={fieldError("message")} />
      </div>

      {state.status === "error" && state.reason !== "validation" && (
        <p role="alert" className="text-sm text-negative">
          {state.reason === "rate-limited" ? dict.form.errorRateLimited : dict.form.errorGeneric}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? dict.form.submitting : dict.form.submit}
        </Button>
      </div>
    </form>
  );
}

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium">
      {children}
      {hint && <span className="text-xs font-normal text-subtle">({hint})</span>}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-negative">
      {message}
    </p>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  dir,
  autoComplete,
  required,
  requiredLabel,
  error,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  required?: boolean;
  requiredLabel?: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} hint={required ? requiredLabel : undefined}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        dir={dir}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "mt-2 w-full rounded-(--radius-md) border bg-surface px-3 py-2.5 text-base",
          error ? "border-negative" : "border-border",
        )}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
