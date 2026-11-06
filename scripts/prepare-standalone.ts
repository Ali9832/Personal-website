import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const staticSource = path.join(root, ".next", "static");
const staticTarget = path.join(standalone, ".next", "static");
const publicSource = path.join(root, "public");
const publicTarget = path.join(standalone, "public");

if (!fs.existsSync(standalone)) {
  throw new Error("standalone output is missing — expected .next/standalone after next build");
}

fs.cpSync(staticSource, staticTarget, { recursive: true, force: true });
fs.cpSync(publicSource, publicTarget, { recursive: true, force: true });

console.log("standalone: copied .next/static and public assets");
