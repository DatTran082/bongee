// The /system-design page's data from the brand kit: the merged tokens (../brandkit/design-system/tokens.json, built
// by brandkit/scripts/build_design_tokens.py) and the four-flower monogram cluster (the print kit's SVG); and the four
// monogram marks as flat paths (src/data/monogram.json: the cup print's own shapes, print/source/01-pp-cup/), which
// the home page draws as crisp vectors in metallic silver (src/components/monogram-mark.tsx).
//
//   npm run sync-design-system
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KIT = path.resolve(ROOT, "../brandkit");
const COPIES = [
  ["design-system/tokens.json", "src/data/design-system.json"],
  ["print/identity/01-logo/cum-4-hoa_den.svg", "src/assets/brand/cum-4-hoa-den.svg"],
];

/** The marks' slugs and their source files (the order of brandkit/scripts/monogram.py). */
const MARKS = {
  "dia-hoa": "hoa-2_dia-hoa_trang.svg",
  "hoa-dac": "hoa-1_hoa-dac_trang.svg",
  "sao-hoa": "hoa-3_sao-hoa_trang.svg",
  "hoa-tron": "hoa-4_hoa-tron_trang.svg",
};

/** Each mark's path data, in its source units (about 100 across, centred: the box −56 −58 112 112). */
function monogramMarks() {
  const marks = {};
  for (const [slug, file] of Object.entries(MARKS)) {
    const svg = readFileSync(path.join(KIT, "print/source/01-pp-cup", file), "utf8");
    const d = /<path d="([^"]+)"/.exec(svg)?.[1];
    if (!d) throw new Error(`${file}: no path`);
    marks[slug] = d;
  }
  const out = "src/data/monogram.json";
  writeFileSync(path.join(ROOT, out), JSON.stringify({ viewBox: "-56 -58 112 112", marks }, null, 2) + "\n");
  console.log(`✓ print/source/01-pp-cup → ${out}`);
}

export function syncDesignSystem() {
  for (const [from, to] of COPIES) {
    copyFileSync(path.join(KIT, from), path.join(ROOT, to));
    console.log(`✓ ${from} → ${to}`);
  }
  monogramMarks();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) syncDesignSystem();
