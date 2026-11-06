/**
 * Export shared form messages from the same dictionaries the React components
 * read. The JSON remains useful to the legacy PHP deployment too.
 *
 * Runs in `prebuild`, so the file exists in public/ before the export copies
 * public/ into out/.
 */
import fs from "node:fs";
import path from "node:path";
import { locales, type Locale } from "../src/lib/i18n/config";
import { getDictionary } from "../src/lib/i18n/get-dictionary";

const OUT = path.join(process.cwd(), "public/api/messages.json");

const payload = Object.fromEntries(
  (locales as readonly Locale[]).map((locale) => {
    const dict = getDictionary(locale);
    return [
      locale,
      {
        validation: dict.contact.validation,
        successTitle: dict.contact.form.successTitle,
        successBody: dict.contact.form.successBody,
        errorTitle: dict.contact.form.errorTitle,
        errorGeneric: dict.contact.form.errorGeneric,
        errorRateLimited: dict.contact.form.errorRateLimited,
        back: dict.notFound.home,
        siteName: dict.meta.siteName,
      },
    ];
  }),
);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`form messages: ${Object.keys(payload).length} locales -> public/api/messages.json`);
