import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { type z, type ZodTypeAny } from "zod";
import { locales, type Locale } from "@/lib/i18n/config";
import { type CollectionName } from "./schemas";

/**
 * The only module in the codebase that knows content lives on disk.
 *
 * Every consumer goes through `loadCollection`, so migrating to a CMS later
 * means reimplementing this one file — the schemas, the pages and the SEO
 * layer never learn where the bytes came from.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type Doc<T> = {
  data: T;
  body: string;
  locale: Locale;
  /** Repo-relative, used in validation errors. */
  source: string;
  wordCount: number;
  readingTimeMinutes: number;
};

/** Persian reads slower per word than English in most measurements. */
const WORDS_PER_MINUTE: Record<Locale, number> = { fa: 190, en: 230 };

function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function collectionDir(collection: CollectionName, locale: Locale): string {
  return path.join(CONTENT_ROOT, collection, locale);
}

function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
}

export class ContentError extends Error {
  constructor(source: string, detail: string) {
    super(`[content] ${source}\n${detail}`);
    this.name = "ContentError";
  }
}

const cache = new Map<string, Doc<unknown>[]>();

/**
 * `S extends ZodTypeAny` plus `z.infer<S>` rather than `schema: ZodType<T>`:
 * the latter lets TypeScript unify T with the schema's *input* type, which
 * makes every field with a `.default()` optional downstream.
 */
export function loadCollection<S extends ZodTypeAny>(
  collection: CollectionName,
  locale: Locale,
  schema: S,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): Doc<z.infer<S>>[] {
  type T = z.infer<S>;
  const key = `${collection}:${locale}:${includeDrafts}`;
  const hit = cache.get(key);
  if (hit) return hit as Doc<T>[];

  const dir = collectionDir(collection, locale);
  const docs: Doc<T>[] = [];

  for (const file of listMdx(dir)) {
    const source = path.posix.join("content", collection, locale, file);
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);

    // Filename is the slug unless the frontmatter overrides it, so the two
    // can never silently disagree.
    const withSlug = { slug: file.replace(/\.mdx$/, ""), ...data };

    const parsed = schema.safeParse(withSlug);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new ContentError(source, detail);
    }

    const wordCount = countWords(content);
    docs.push({
      data: parsed.data,
      body: content,
      locale,
      source,
      wordCount,
      readingTimeMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE[locale])),
    });
  }

  const visible =
    includeDrafts || process.env.NODE_ENV === "development"
      ? docs
      : docs.filter((d) => !(d.data as { draft?: boolean }).draft);

  cache.set(key, visible as Doc<unknown>[]);
  return visible;
}

export function loadAllLocales<S extends ZodTypeAny>(
  collection: CollectionName,
  schema: S,
  options?: { includeDrafts?: boolean },
): Doc<z.infer<S>>[] {
  return locales.flatMap((locale) => loadCollection(collection, locale, schema, options));
}

export function clearContentCache(): void {
  cache.clear();
}
