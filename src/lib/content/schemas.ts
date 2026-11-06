import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const localeSchema = z.enum(locales);

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case ASCII");

/**
 * Fields every document carries.
 *
 * `translationKey` is what pairs the Persian and English version of a
 * document. Slugs are deliberately independent — `speed-optimization` and
 * `behine-sazi-sorat-site` should be free to differ per market — so hreflang
 * cannot be derived from the slug and needs its own key.
 */
const baseSchema = z.object({
  slug: slugSchema,
  translationKey: z.string().min(1),
  title: z.string().min(3).max(90),
  /** Overrides <title> when the on-page title is not the best SERP title. */
  metaTitle: z.string().max(65).optional(),
  metaDescription: z.string().min(50).max(165),
  draft: z.boolean().default(false),
  updatedAt: z.coerce.date().optional(),
});

export const serviceIcons = [
  "speed",
  "wordpress",
  "woocommerce",
  "plugin",
  "react",
  "extension",
] as const;

export const faqSchema = z.object({
  q: z.string().min(5),
  a: z.string().min(20),
});

export const serviceSchema = baseSchema.extend({
  /** Separate from `title`: <title> is written for the SERP, <h1> for the reader. */
  h1: z.string().min(5).max(90),
  navLabel: z.string().min(2).max(40),
  primaryKeyword: z.string().min(2),
  secondaryKeywords: z.array(z.string()).default([]),
  summary: z.string().min(40).max(220),
  icon: z.enum(serviceIcons),
  order: z.number().int().nonnegative(),
  deliverables: z.array(z.string().min(5)).min(3),
  process: z
    .array(z.object({ title: z.string().min(3), body: z.string().min(20) }))
    .min(3),
  // At least three FAQs, because the FAQPage JSON-LD is only worth emitting
  // when the block is genuinely useful on the page.
  faq: z.array(faqSchema).min(3),
  priceFrom: z.number().positive().optional(),
  priceCurrency: z.enum(["IRT", "USD"]).optional(),
  relatedServices: z.array(slugSchema).max(3).default([]),
});

export const metricSchema = z.object({
  label: z.string().min(2),
  /**
   * Omit for a delivered-scope figure (pages, flows, languages) where there
   * is no honest "before". A before of 0 renders as a meaningless "−0%".
   */
  before: z.number().optional(),
  after: z.number(),
  unit: z.enum(["s", "ms", "%", "score", "x", "req", "KB", "count"]),
  direction: z.enum(["lower-is-better", "higher-is-better"]),
});

export const caseStudySchema = baseSchema.extend({
  client: z.string().min(2),
  clientAnonymous: z.boolean().default(false),
  industry: z.string().min(2),
  year: z.number().int().min(2015).max(2100),
  /** Required: this is what guarantees every case study links to a service. */
  service: slugSchema,
  stack: z.array(z.string().min(1)).min(1),
  cover: z.string().min(1),
  /** Describes the screenshot for image search and screen readers on the detail page. */
  coverAlt: z.string().min(5).max(160).optional(),
  /** Kept out of the MDX body so the listing card can reuse it verbatim. */
  problem: z.string().min(60).max(400),
  // min(1): "result with a number" is enforced by the type system, not a
  // checklist. A case study without a measurement fails the build.
  metrics: z.array(metricSchema).min(1),
  testimonial: z
    .object({
      quote: z.string().min(20),
      author: z.string().min(2),
      role: z.string().min(2),
    })
    .optional(),
  liveUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

export const postSchema = baseSchema.extend({
  description: z.string().min(50).max(300),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string().min(2)).min(1).max(5),
  cover: z.string().optional(),
  /** Required: enforces the internal-linking rule at build time. */
  relatedService: slugSchema,
  relatedPosts: z.array(slugSchema).max(3).default([]),
  faq: z.array(faqSchema).optional(),
});

export type Service = z.infer<typeof serviceSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Post = z.infer<typeof postSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type ServiceIcon = (typeof serviceIcons)[number];

export const collectionSchemas = {
  services: serviceSchema,
  portfolio: caseStudySchema,
  blog: postSchema,
} as const;

export type CollectionName = keyof typeof collectionSchemas;
