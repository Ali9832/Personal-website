/**
 * Copies the variable-font subsets we actually use out of node_modules and
 * into src/assets/fonts, where next/font/local picks them up.
 *
 * Fonts come from npm rather than a CDN so the build is reproducible offline
 * and self-hosting is the only code path — nothing ever reaches a third-party
 * font host at runtime.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/assets/fonts");

const FILES = [
  // Persian/Arabic glyphs only — Latin words inside Persian text fall through
  // to Inter, which is intentional.
  [
    "@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2",
    "vazirmatn-arabic-var.woff2",
  ],
  [
    "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    "inter-latin-var.woff2",
  ],
  [
    "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
    "jetbrains-mono-latin-var.woff2",
  ],
];

await mkdir(out, { recursive: true });

for (const [from, to] of FILES) {
  const src = path.join(root, "node_modules", from);
  if (!existsSync(src)) {
    console.error(`missing: ${from} — run \`npm install\` first`);
    process.exitCode = 1;
    continue;
  }
  await copyFile(src, path.join(out, to));
  console.log(`fonts: ${to}`);
}
