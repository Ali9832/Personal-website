import en from "./dictionaries/en.json";
import fa from "./dictionaries/fa.json";
import { type Locale } from "./config";

/**
 * Dictionaries are imported statically, not `await import()`ed. Both files
 * together are a few kB, every consumer is a server component, and a
 * synchronous lookup keeps `generateMetadata` and the page body from each
 * paying an async hop.
 */
const dictionaries = { fa, en } satisfies Record<Locale, unknown>;

/** `fa` is the reference shape — `en` is type-checked against it. */
export type Dictionary = typeof fa;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
