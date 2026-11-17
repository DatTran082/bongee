// The /menu page's photos: each dish's lookbook studio photo from the brand kit (../brandkit/lookbook, or
// BOONGEE_BRANDKIT), cropped to 4:5 and written as WebP named after its content (public/menu/lookbook/*.<hash>.webp,
// cached immutable by next.config.ts), their URLs by Odoo dish name in src/data/lookbook.json; and the page's hand-drawn
// Lottie (../brandkit/lottie/menu-hero.json, built from menu-hero.scene.mjs with the hand-drawn-lottie skill).
//
//   npm run sync-lookbook        (sync-brand runs it too, since it wipes public/menu)
//
// A dish uses its v3 photo (lookbook/assets-v3/<stem>.png) when it is listed in V3 and the file exists, else its v2
// photo (lookbook/assets/<stem>.jpg). Keys are the dishes' names on the till (Odoo); a name missing from the till is
// reported and skipped, a till dish missing here simply shows no photo. Never put names, prices or notes here.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRANDKIT = path.resolve(process.env.BOONGEE_BRANDKIT ?? path.join(ROOT, "..", "brandkit"));
const LOOKBOOK = path.join(BRANDKIT, "lookbook");
const ANIMATION = path.join(BRANDKIT, "lottie", "menu-hero.json");
const OUT_DIR = path.join(ROOT, "public/menu/lookbook");
const DATA = path.join(ROOT, "src/data/lookbook.json");
const FULL = { width: 1200, height: 1500 };
const THUMB = { width: 600, height: 750 };

/** Odoo dish name → photo file stem in the brand kit's lookbook. */
const PHOTOS = {
  "Bạch Lan Hoa": "03-studio-tra-sua-bach-lan-hoa",
  "Bạch Thiên Hương": "05-studio-bach-thien-huong",
  "Bạch Đào Hoa": "05-studio-bach-dao-hoa",
  "Thanh Nhài": "05-studio-thanh-nhai",
  "Thanh Trúc": "05-studio-thanh-truc",
  "Bông Lan": "03-studio-tra-sua-kem-bong-lan",
  "Bông Trúc": "05-studio-bong-truc",
  "Bông Đào": "05-studio-bong-dao",
  "Hồng Bì Cóc Xanh": "04-studio-tra-coc-hong-bi",
  "Thanh Nho Tươi": "03-studio-tra-hoa-qua-nho-thanh-truc",
  "Thanh Nho Tằm": "05-studio-tra-nho-tam",
  "Xoài Hạ Tuyết": "04-studio-xoai-ha-tuyet",
  "Dâu Cheese": "04-studio-dau-kem-cheese",
  "Lài Cheese": "05-studio-lai-cheese",
  "Nho Cheese": "03-studio-hoa-qua-kem-cheese-nho-tam",
  "Bạc Xỉu": "05-studio-bac-xiu",
  "Coldbrew Bưởi": "03-studio-cafe-coldbrew-buoi",
  "Coldbrew Chanh Vàng": "05-studio-coldbrew-chanh-vang",
  "Coldbrew Khế": "04-studio-coldbrew-khe",
  "Coldbrew Nguyên Bản": "06-studio-coldbrew-nguyen-ban",
  "Cà Phê Muối": "05-studio-ca-phe-muoi",
  "Cà Phê Đen Đá": "05-studio-ca-phe-den-da",
  "Kem Bông": "08-studio-topping-kem-bong",
  "Kem Cheese": "08-studio-topping-kem-cheese",
  "Combo Bộ Ba Làng Mây": "07-studio-combo-bo-ba-lang-may",
  "Combo Cặp Đôi Đối Lập": "07-studio-combo-cap-doi-doi-lap",
  "Combo Song Hoa Tinh Túy": "07-studio-combo-song-hoa-tinh-tuy",
  "Combo Thanh Mát Làng Mây": "07-studio-combo-thanh-mat-lang-may",
  "Combo Trái Cây & Kem Cheese": "07-studio-combo-trai-cay-kem-cheese",
  "Combo Tỉnh Táo & Thanh Lọc": "07-studio-combo-tinh-tao-thanh-loc",
};

/** Stems whose v3 photo (brandkit/lookbook/prompts-lookbook-v3.md) is the one to show. */
const V3 = new Set([
  "04-studio-tra-coc-hong-bi",
  "04-studio-xoai-ha-tuyet",
  "04-studio-dau-kem-cheese",
  "05-studio-lai-cheese",
  "03-studio-hoa-qua-kem-cheese-nho-tam",
  "08-studio-topping-kem-cheese",
  "05-studio-bong-dao",
]);

/** The ASCII slug of a dish name, for its file name ("Cà Phê Đen Đá" → "ca-phe-den-da"). */
function slug(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function source(stem) {
  const v3 = path.join(LOOKBOOK, "assets-v3", `${stem}.png`);
  if (V3.has(stem) && existsSync(v3)) return { file: v3, edition: "v3" };
  const v2 = path.join(LOOKBOOK, "assets", `${stem}.jpg`);
  return existsSync(v2) ? { file: v2, edition: "v2" } : null;
}

async function webp(file, size, name) {
  const buffer = await sharp(file)
    .resize({ ...size, fit: "cover", position: "centre" })
    .webp({ quality: 84 })
    .toBuffer();
  const hashedName = `${name}.${createHash("sha256").update(buffer).digest("hex").slice(0, 8)}.webp`;
  writeFileSync(path.join(OUT_DIR, hashedName), buffer);
  return `/menu/lookbook/${hashedName}`;
}

/** Writes the photos and src/data/lookbook.json; returns how many dishes got a photo. */
export async function syncLookbook() {
  const till = JSON.parse(readFileSync(path.join(ROOT, "src/data/odoo/menu.json"), "utf8"));
  const onTill = new Set(till.groups.flatMap((group) => group.items.map((item) => item.name)));
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const photos = {};
  for (const [name, stem] of Object.entries(PHOTOS)) {
    if (!onTill.has(name)) {
      console.warn(`! ${name}: không có trên quầy (Odoo), bỏ qua`);
      continue;
    }
    const found = source(stem);
    if (!found) {
      console.warn(`! ${name}: không thấy ảnh ${stem} trong ${LOOKBOOK}`);
      continue;
    }
    const base = slug(name);
    photos[name] = {
      full: await webp(found.file, FULL, base),
      thumb: await webp(found.file, THUMB, `${base}-thumb`),
      width: FULL.width,
      height: FULL.height,
      edition: found.edition,
    };
  }
  // the page's Lottie: copied as is (it is already compact), named after its content like the photos
  let animation = null;
  if (existsSync(ANIMATION)) {
    const json = readFileSync(ANIMATION);
    const name = `menu-hero.${createHash("sha256").update(json).digest("hex").slice(0, 8)}.json`;
    writeFileSync(path.join(OUT_DIR, name), json);
    animation = `/menu/lookbook/${name}`;
  } else {
    console.warn(`! không thấy ${ANIMATION}: trang /menu sẽ không có Lottie`);
  }
  writeFileSync(
    DATA,
    JSON.stringify({ _readme: "Generated by scripts/sync-lookbook.mjs. Do not edit.", animation, photos }, null, 2) +
      "\n",
  );
  const count = Object.keys(photos).length;
  console.log(
    `✓ lookbook: ${count} ảnh → public/menu/lookbook, src/data/lookbook.json (${readdirSync(OUT_DIR).length} file)`,
  );
  return count;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await syncLookbook();
}
