/**
 * Build-time responsive images.
 *
 * Drop a source file in /assets/images and this emits AVIF + WebP + a JPEG
 * fallback at four widths into /public/media, plus a manifest with intrinsic
 * dimensions and a blur placeholder. The <Picture> component reads that
 * manifest, so every image ships with width/height (CLS = 0) and the runtime
 * never resizes anything.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "assets/images");
const OUT = path.join(process.cwd(), "public/media");
const MANIFEST = path.join(process.cwd(), "src/lib/media/manifest.json");

const WIDTHS = [480, 768, 1200, 1600] as const;
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export type MediaEntry = {
  width: number;
  height: number;
  widths: number[];
  avif: string;
  webp: string;
  fallback: string;
  blurDataURL: string;
};

function listSources(dir: string, base = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) return listSources(path.join(dir, entry.name), rel);
    return SOURCE_EXT.has(path.extname(entry.name).toLowerCase()) ? [rel] : [];
  });
}

async function main(): Promise<void> {
  const sources = listSources(SRC);
  const manifest: Record<string, MediaEntry> = {};

  for (const rel of sources) {
    const key = rel.replace(/\.[^.]+$/, "");
    const input = path.join(SRC, rel);
    const outDir = path.join(OUT, key);
    fs.mkdirSync(outDir, { recursive: true });

    const image = sharp(input);
    const meta = await image.metadata();
    const intrinsicWidth = meta.width ?? WIDTHS[WIDTHS.length - 1];
    const intrinsicHeight = meta.height ?? Math.round(intrinsicWidth * 0.625);

    const widths = WIDTHS.filter((w) => w <= intrinsicWidth);
    if (widths.length === 0) widths.push(intrinsicWidth as (typeof WIDTHS)[number]);

    for (const width of widths) {
      await sharp(input).resize({ width }).avif({ quality: 55, effort: 6 })
        .toFile(path.join(outDir, `${width}.avif`));
      await sharp(input).resize({ width }).webp({ quality: 72 })
        .toFile(path.join(outDir, `${width}.webp`));
    }

    const fallbackWidth = widths[widths.length - 1]!;
    await sharp(input).resize({ width: fallbackWidth }).jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(outDir, `${fallbackWidth}.jpg`));

    // 16px LQIP inlined as a data URI — a few hundred bytes, no extra request.
    const blur = await sharp(input).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();

    manifest[`/media/${key}`] = {
      width: intrinsicWidth,
      height: intrinsicHeight,
      widths: [...widths],
      avif: `/media/${key}/{w}.avif`,
      webp: `/media/${key}/{w}.webp`,
      fallback: `/media/${key}/${fallbackWidth}.jpg`,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };

    console.log(`media: ${key} (${widths.join(", ")})`);
  }

  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`media: ${sources.length} source image(s) processed`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
