/**
 * Runs as `prebuild`. A content mistake should fail here, loudly, with a file
 * path — not silently produce a page with a broken internal link or a case
 * study with no numbers in it.
 */
import fs from "node:fs";
import path from "node:path";
import { locales, type Locale } from "../src/lib/i18n/config";
import { loadCollection } from "../src/lib/content/reader";
import {
  caseStudySchema,
  postSchema,
  serviceSchema,
} from "../src/lib/content/schemas";
import { improvement } from "../src/lib/i18n/format";

const errors: string[] = [];
const warnings: string[] = [];

const fail = (where: string, msg: string) => errors.push(`✗ ${where}\n    ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`! ${where}\n    ${msg}`);

const PUBLIC = path.join(process.cwd(), "public");

function assertAsset(where: string, asset: string) {
  if (/^https?:\/\//.test(asset)) return;
  const rel = asset.startsWith("/") ? asset.slice(1) : asset;
  if (!fs.existsSync(path.join(PUBLIC, rel))) {
    warn(where, `asset not found in /public: ${asset}`);
  }
}

function uniqueSlugs(where: string, slugs: string[]) {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) fail(where, `duplicate slug: ${slug}`);
    seen.add(slug);
  }
}

type KeyIndex = Record<string, Set<string>>;
const translationKeys: Record<"services" | "portfolio" | "blog", KeyIndex> = {
  services: {},
  portfolio: {},
  blog: {},
};

for (const locale of locales as readonly Locale[]) {
  const services = loadCollection("services", locale, serviceSchema, { includeDrafts: true });
  const portfolio = loadCollection("portfolio", locale, caseStudySchema, { includeDrafts: true });
  const posts = loadCollection("blog", locale, postSchema, { includeDrafts: true });

  uniqueSlugs(`services/${locale}`, services.map((d) => d.data.slug));
  uniqueSlugs(`portfolio/${locale}`, portfolio.map((d) => d.data.slug));
  uniqueSlugs(`blog/${locale}`, posts.map((d) => d.data.slug));

  const serviceSlugs = new Set(services.map((d) => d.data.slug));
  const postSlugs = new Set(posts.map((d) => d.data.slug));

  for (const doc of services) {
    translationKeys.services[doc.data.translationKey] ??= new Set();
    translationKeys.services[doc.data.translationKey]!.add(locale);

    for (const related of doc.data.relatedServices) {
      if (!serviceSlugs.has(related)) {
        fail(doc.source, `relatedServices points at a service that does not exist: "${related}"`);
      }
      if (related === doc.data.slug) {
        fail(doc.source, `relatedServices includes the service itself`);
      }
    }
    if (doc.data.priceFrom !== undefined && !doc.data.priceCurrency) {
      fail(doc.source, `priceFrom is set but priceCurrency is missing`);
    }
  }

  for (const doc of portfolio) {
    translationKeys.portfolio[doc.data.translationKey] ??= new Set();
    translationKeys.portfolio[doc.data.translationKey]!.add(locale);

    if (!serviceSlugs.has(doc.data.service)) {
      fail(doc.source, `service "${doc.data.service}" does not exist in content/services/${locale}`);
    }
    assertAsset(doc.source, doc.data.cover);

    for (const metric of doc.data.metrics) {
      if (metric.before === undefined) continue;
      if (metric.before === 0) {
        fail(doc.source, `metric "${metric.label}" has before: 0 — omit "before" for a delivered-scope figure`);
        continue;
      }
      const delta = improvement(metric.before, metric.after, metric.direction);
      if (delta <= 0) {
        warn(
          doc.source,
          `metric "${metric.label}" shows no improvement (${metric.before} → ${metric.after}, ${metric.direction})`,
        );
      }
    }
  }

  for (const doc of posts) {
    translationKeys.blog[doc.data.translationKey] ??= new Set();
    translationKeys.blog[doc.data.translationKey]!.add(locale);

    if (!serviceSlugs.has(doc.data.relatedService)) {
      fail(
        doc.source,
        `relatedService "${doc.data.relatedService}" does not exist in content/services/${locale}`,
      );
    }
    for (const related of doc.data.relatedPosts) {
      if (!postSlugs.has(related)) {
        fail(doc.source, `relatedPosts points at a missing post: "${related}"`);
      }
    }
    if (doc.data.cover) assertAsset(doc.source, doc.data.cover);
    if (doc.data.updatedAt && doc.data.updatedAt < doc.data.publishedAt) {
      fail(doc.source, `updatedAt is earlier than publishedAt`);
    }
  }
}

// Missing translations are a warning, not an error: shipping a Persian post
// before its English version is a normal state, and hreflang already degrades
// gracefully when the pair is absent.
for (const [collection, index] of Object.entries(translationKeys)) {
  for (const [key, present] of Object.entries(index)) {
    const missing = (locales as readonly string[]).filter((l) => !present.has(l));
    if (missing.length > 0) {
      warn(`${collection}`, `translationKey "${key}" has no ${missing.join(", ")} version`);
    }
  }
}

if (warnings.length > 0) {
  console.warn(`\ncontent warnings (${warnings.length}):\n${warnings.join("\n")}\n`);
}

if (errors.length > 0) {
  console.error(`\ncontent errors (${errors.length}):\n${errors.join("\n")}\n`);
  process.exit(1);
}

console.log(`content: ok — ${locales.length} locales validated, ${warnings.length} warning(s)`);
