"use server";

import { headers } from "next/headers";
import { handleContact } from "@/lib/contact/handle";
import { type ContactResult } from "@/lib/contact/schema";

/**
 * Thin wrapper over the same handler the API route uses. Existing as a server
 * action is what makes the form submit — and validate, and deliver — with
 * JavaScript disabled.
 */
export async function submitContact(
  _previous: ContactResult,
  formData: FormData,
): Promise<ContactResult> {
  const form = Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, String(value)]),
  );
  return handleContact(form, await headers());
}
