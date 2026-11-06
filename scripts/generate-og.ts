/**
 * Build-time OG card generation.
 *
 * Runs as `postbuild` and writes static PNGs into /public/og. Doing this at
 * runtime with `next/og` would burn CPU on every crawl of every page for an
 * image whose inputs are fixed at build time — and on a shared Node host that
 * CPU is the scarcest thing there is.
 *
 * resvg (rustybuzz) is used rather than satori because it performs real
 * Arabic-script shaping and bidi reordering; satori renders Persian as
 * disconnected letterforms.
 */
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { locales, type Locale } from "../src/lib/i18n/config";
import { getDictionary } from "../src/lib/i18n/get-dictionary";
import { formatMetricValue } from "../src/lib/i18n/format";
import { getCaseStudies, getPosts, getServices } from "../src/lib/content";
import { navOrder, ogKey, routes } from "../src/lib/seo/routes";

const W = 1200;
const H = 630;
const PAD = 76;
const MAX_TEXT = W - PAD * 2;

const FONT_DIR = path.join(process.cwd(), "node_modules/vazirmatn/fonts/ttf");
const FONT_FILES = [
  path.join(FONT_DIR, "Vazirmatn-Bold.ttf"),
  path.join(FONT_DIR, "Vazirmatn-Medium.ttf"),
  path.join(FONT_DIR, "Vazirmatn-Regular.ttf"),
];

const OUT = path.join(process.cwd(), "public/og");

const COLORS = {
  bg: "#0c0a09",
  text: "#fafaf9",
  muted: "#a8a29e",
  accent: "#f59e0b",
  rule: "#292524",
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const fontOptions = {
  fontFiles: FONT_FILES,
  loadSystemFonts: false,
  defaultFontFamily: "Vazirmatn",
};

const measureCache = new Map<string, number>();

/** Real shaped width, measured by rendering the run and reading its bbox. */
function measure(text: string, size: number, weight: number): number {
  const key = `${weight}:${size}:${text}`;
  const cached = measureCache.get(key);
  if (cached !== undefined) return cached;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="${size * 2}">` +
    `<text x="0" y="${size}" font-family="Vazirmatn" font-size="${size}" font-weight="${weight}">${esc(text)}</text>` +
    `</svg>`;
  const width = new Resvg(svg, { font: fontOptions }).getBBox()?.width ?? 0;
  measureCache.set(key, width);
  return width;
}

function wrap(text: string, size: number, weight: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size, weight) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Shrink until the headline fits in at most three lines. */
function fitTitle(title: string): { size: number; lines: string[] } {
  for (const size of [66, 58, 50, 44]) {
    const lines = wrap(title, size, 700, MAX_TEXT);
    if (lines.length <= 3) return { size, lines };
  }
  const lines = wrap(title, 44, 700, MAX_TEXT).slice(0, 3);
  return { size: 44, lines };
}

type Card = {
  locale: Locale;
  eyebrow: string;
  title: string;
  footnote?: string;
};

function renderSvg({ locale, eyebrow, title, footnote }: Card): string {
  const rtl = locale === "fa";
  const dir = rtl ? "rtl" : "ltr";
  const anchor = rtl ? "end" : "start";
  const x = rtl ? W - PAD : PAD;
  const xOpposite = rtl ? PAD : W - PAD;
  const anchorOpposite = rtl ? "start" : "end";

  const { size, lines } = fitTitle(title);
  const lineHeight = Math.round(size * 1.38);
  const blockHeight = lines.length * lineHeight;
  // Optically centred between the eyebrow and the footer rule.
  const titleTop = Math.round((H - blockHeight) / 2) + 14;

  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="${x}" y="${titleTop + i * lineHeight}">${esc(line)}</tspan>`,
    )
    .join("");

  const dict = getDictionary(locale);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
  <rect width="${W}" height="7" fill="${COLORS.accent}"/>

  <text x="${x}" y="${PAD + 74}" direction="${dir}" text-anchor="${anchor}"
        font-family="Vazirmatn" font-size="27" font-weight="500"
        fill="${COLORS.accent}" letter-spacing="0.06em">${esc(eyebrow)}</text>

  <text direction="${dir}" text-anchor="${anchor}" font-family="Vazirmatn"
        font-size="${size}" font-weight="700" fill="${COLORS.text}">${titleTspans}</text>

  <line x1="${PAD}" y1="${H - PAD - 62}" x2="${W - PAD}" y2="${H - PAD - 62}"
        stroke="${COLORS.rule}" stroke-width="1"/>

  <text x="${x}" y="${H - PAD - 12}" direction="${dir}" text-anchor="${anchor}"
        font-family="Vazirmatn" font-size="30" font-weight="700"
        fill="${COLORS.text}">${esc(dict.meta.siteName)}</text>

  <text x="${xOpposite}" y="${H - PAD - 14}" direction="${dir}" text-anchor="${anchorOpposite}"
        font-family="Vazirmatn" font-size="24" font-weight="400"
        fill="${COLORS.muted}">${esc(footnote ?? dict.meta.role)}</text>
</svg>`;
}

function writeCard(key: string, card: Card): void {
  const png = new Resvg(renderSvg(card), {
    font: fontOptions,
    fitTo: { mode: "width", value: W },
  })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT, `${key}.png`), png);
}

async function writeIcons(): Promise<void> {
  const svg = fs.readFileSync(path.join(process.cwd(), "public/icon.svg"));
  for (const size of [192, 512]) {
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(process.cwd(), `public/icon-${size}.png`));
  }
  await sharp(svg, { density: 384 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(process.cwd(), "public/apple-icon.png"));
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });

  let count = 0;
  for (const locale of locales as readonly Locale[]) {
    const dict = getDictionary(locale);

    writeCard(ogKey(locale, ""), {
      locale,
      eyebrow: dict.meta.role,
      title: dict.home.h1,
    });

    for (const key of navOrder) {
      const section = dict.nav[key];
      writeCard(ogKey(locale, routes[key]), {
        locale,
        eyebrow: dict.meta.siteName,
        title: section,
      });
      count++;
    }

    for (const doc of getServices(locale)) {
      writeCard(ogKey(locale, `${routes.services}/${doc.data.slug}`), {
        locale,
        eyebrow: dict.nav.services,
        title: doc.data.h1,
      });
      count++;
    }

    for (const doc of getCaseStudies(locale)) {
      // Only a real before/after earns a place on the social card.
      const headline = doc.data.metrics.find((m) => m.before !== undefined);
      writeCard(ogKey(locale, `${routes.portfolio}/${doc.data.slug}`), {
        locale,
        eyebrow: dict.nav.portfolio,
        title: doc.data.title,
        footnote:
          headline?.before !== undefined
            ? `${headline.label}: ${formatMetricValue(headline.before, headline.unit, locale)} → ${formatMetricValue(headline.after, headline.unit, locale)}`
            : undefined,
      });
      count++;
    }

    for (const doc of getPosts(locale)) {
      writeCard(ogKey(locale, `${routes.blog}/${doc.data.slug}`), {
        locale,
        eyebrow: dict.nav.blog,
        title: doc.data.title,
      });
      count++;
    }
  }

  await writeIcons();
  console.log(`og: ${count + locales.length} cards + icons written to public/og`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
