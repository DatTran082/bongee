// The /system-design page's data from the brand kit: the merged tokens (../brandkit/design-system/tokens.json, built
// by brandkit/scripts/build_design_tokens.py) and the four-flower monogram cluster (the print kit's SVG).
//
//   npm run sync-design-system
import { copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KIT = path.resolve(ROOT, "../brandkit");
const COPIES = [
  ["design-system/tokens.json", "src/data/design-system.json"],
  ["print/identity/01-logo/cum-4-hoa_den.svg", "src/assets/brand/cum-4-hoa-den.svg"],
];

export function syncDesignSystem() {
  for (const [from, to] of COPIES) {
    copyFileSync(path.join(KIT, from), path.join(ROOT, to));
    console.log(`✓ ${from} → ${to}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) syncDesignSystem();
