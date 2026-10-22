#!/usr/bin/env node
// Copies the Boongee brand assets this site uses from the brand kit (../brandkit, or BOONGEE_BRANDKIT) and derives
// the web-only files from them. Run after the brand kit changes: `npm run sync-brand`. Everything it writes is
// committed, so building and deploying the site never needs the brand kit.
//
//   color/tokens.json                                  → src/styles/brand-tokens.css   Tailwind colours bg-brand-*…
//                                                        src/data/brand-tokens.json    the same, for TypeScript
//
// From the Làng Mây edition (../brandkit-ghibli, or BOONGEE_LANGMAY), the stylized low-poly look of the 3D stage:
//
//   color/tokens.json, its `use: illustration` colours → added to the two token files above (sky, cloud, moss, …;
//                                                        for the 3D and decoration only, never text or print)
//   color/tokens.json → toon                           → src/data/brand-toon.json   bands, shade, outline, highlight
//   nhan-dien/logo-ngang_hong.svg                      → src/assets/lang-may/logo-ngang.svg   the header's logo
//   nhan-dien/hoa-low-poly_hong.svg, hoa-ve-tay_hong.svg → src/assets/lang-may/hoa*.svg      headings, bullets
//   thuc-don/ly/*.png, featured.json, lookbook/poster.* → public/menu/ly/*.png, public/menu/poster.jpg, src/data/menu-featured.json
//   nhan-dien/monogram/*.svg (the groups' marks)       → public/menu/mark/*.svg
//                                                        the menu section's cups and lookbook photo (as the menu board)
//   nhan-dien/bien-may.svg, doi-che.svg                → src/assets/lang-may/   cloud bank, tea hills (the page's
//                                                        scenery, src/components/lang-may/)
//   nhan-dien/01-logo/bieu-tuong-hoa_den.svg           → src/assets/brand/hoa.svg (the floating marks of the 3D stage),
//                                                        src/app/icon.svg, favicon.ico, apple-icon.png
//   nhan-dien/03-hoa-tiet/monogram_hong.png            → src/assets/images/monogram-hong.png
//   lookbook/anh-bia/facebook.png                      → src/assets/images/hero.jpg   shown only when the 3D cup cannot
//   nhan-dien/04-anh-bia/facebook-slogan-den.png       → src/app/opengraph-image.jpg, twitter-image.jpg (1200 × 628)
//   3d/boongee-pp-700ml.glb, 3d/boongee-paper-16oz.glb → public/models/<name>.<hash>.glb   the 3D cups, compressed,
//                                                        prints only (≤ 2048 px), no normal or metal maps
//                                                        src/data/cup-model.json          their URLs
//
// The menu and the offers come from the ShanMay brand kit (../../ShanMay/brand-kit, or BOONGEE_SHANMAY), the same
// files the printed menu and the vouchers are built from, so the site and the print never disagree:
//
//   menu-posm/print-ready/menu-data.json               → src/data/shanmay/menu-data.json    categories, items, prices
//   collateral/collateral.json                         → src/data/shanmay/collateral.json   weekly offer, loyalty card

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, textureCompress } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KIT = path.resolve(process.env.BOONGEE_BRANDKIT ?? path.join(ROOT, "..", "brandkit"));
const LANGMAY = path.resolve(process.env.BOONGEE_LANGMAY ?? path.join(ROOT, "..", "brandkit-ghibli"));
const SHANMAY = path.resolve(process.env.BOONGEE_SHANMAY ?? path.join(ROOT, "..", "..", "ShanMay", "brand-kit"));
const OG = { width: 1200, height: 628 };
const OG_ALT = "Boongee — Trà hương thanh vị: hai ly Boongee in hoa monogram màu bạc trên nền hồng";
const TOUCH_ICON = 180;
const FAVICON = 32;
/** The cup models, with the nodes the 3D stage looks up by name (src/lib/cup-scene/model.ts, set/index.ts). */
const CUPS = {
  pp: {
    name: "boongee-pp-700ml",
    nodes: ["boongee-pp-700ml", "cup-body", "drink", "lid", "lid-strap", "lid-strap-cap", "print"],
  },
  paper: {
    name: "boongee-paper-16oz",
    nodes: ["boongee-paper-16oz", "cup-sleeve-print", "drink", "lid", "lid-strap", "lid-strap-cap"],
  },
};

const langMay = (rel) => {
  const file = path.join(LANGMAY, rel);
  if (!existsSync(file)) throw new Error(`Thiếu ${file}: dựng lại brandkit-ghibli (scripts/build_lang_may.py).`);
  return file;
};
const kit = (rel) => {
  const file = path.join(KIT, rel);
  if (!existsSync(file)) throw new Error(`Thiếu ${file}: dựng lại brand kit trước (xem brandkit/CLAUDE.md).`);
  return file;
};
const shanmay = (rel) => {
  const file = path.join(SHANMAY, rel);
  if (!existsSync(file)) throw new Error(`Thiếu ${file}: đặt BOONGEE_SHANMAY=<đường dẫn ShanMay/brand-kit>.`);
  return file;
};
const out = (rel) => {
  const file = path.join(ROOT, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  return file;
};
const done = (rel) => console.log("ok:", rel);

function copy(from, to) {
  copyFileSync(kit(from), out(to));
  done(to);
}

function write(rel, data) {
  writeFileSync(out(rel), data);
  done(rel);
}

/**
 * The brand colours as Tailwind theme variables (`--color-brand-<token>`), from the kit's single colour source, with
 * the Làng Mây edition's illustration colours after them (they never replace a core colour), and its toon rules.
 */
function tokens() {
  const { color } = JSON.parse(readFileSync(kit("color/tokens.json"), "utf8"));
  const langMayFile = path.join(LANGMAY, "color/tokens.json");
  if (!existsSync(langMayFile))
    throw new Error(`Thiếu ${langMayFile}: đặt BOONGEE_LANGMAY=<đường dẫn brandkit-ghibli>.`);
  const langMay = JSON.parse(readFileSync(langMayFile, "utf8"));
  const accents = Object.entries(langMay.color).filter(
    ([name, spec]) => spec.use === "illustration" && !(name in color),
  );
  const hex = Object.fromEntries([...Object.entries(color), ...accents].map(([name, spec]) => [name, spec.hex]));
  write("src/data/brand-toon.json", JSON.stringify(langMay.toon, null, 2) + "\n");
  const lines = Object.entries(hex).map(([name, value]) => `  --color-brand-${name}: ${value};`);
  write(
    "src/styles/brand-tokens.css",
    "/* Generated by scripts/sync-brand.mjs from brandkit/ and brandkit-ghibli/color/tokens.json. Do not edit. */\n" +
      `@theme {\n${lines.join("\n")}\n}\n`,
  );
  write("src/data/brand-tokens.json", JSON.stringify(hex, null, 2) + "\n");
  return hex;
}

/** A PNG wrapped in a one-image .ico (browsers read PNG-encoded icons). */
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // image data offset
  return Buffer.concat([header, png]);
}

/** The logo flower on the brand pink, square, with a margin (iOS home screen, browser tabs). */
async function flowerIcon(size, ground, margin) {
  const inner = Math.round(size * (1 - 2 * margin));
  const flower = await sharp(kit("nhan-dien/01-logo/bieu-tuong-hoa_den.svg"), { density: 600 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: ground } })
    .composite([{ input: flower, gravity: "center" }])
    .png()
    .toBuffer();
}

async function icons(hex) {
  copy("nhan-dien/01-logo/bieu-tuong-hoa_den.svg", "src/app/icon.svg");
  write("src/app/apple-icon.png", await flowerIcon(TOUCH_ICON, hex["pink-500"], 0.16));
  write("src/app/favicon.ico", ico(await flowerIcon(FAVICON, hex["pink-500"], 0.08), FAVICON));
}

async function photos() {
  // flatten: the AI photo is opaque, but never let a stray alpha channel turn black in the JPEG
  await sharp(kit("lookbook/anh-bia/facebook.png"))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(out("src/assets/images/hero.jpg"));
  done("src/assets/images/hero.jpg");
  // Share image: the cover with the slogan, cut to 1.91 : 1 round the slogan and the cups.
  const cover = sharp(kit("nhan-dien/04-anh-bia/facebook-slogan-den.png"));
  const { width, height } = await cover.metadata();
  const cropW = Math.round((height * OG.width) / OG.height);
  const left = Math.round(Math.min(width - cropW, width * 0.12));
  const og = await cover
    .extract({ left, top: 0, width: cropW, height })
    .resize(OG.width, OG.height)
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  for (const name of ["opengraph-image", "twitter-image"]) {
    write(`src/app/${name}.jpg`, og);
    write(`src/app/${name}.alt.txt`, OG_ALT);
  }
}

/**
 * A cup for the 3D stage, compressed for the web (meshopt geometry, WebP textures; 1.3–2 MB → a few hundred kB). Quantization folds a scale and offset into the matrix of each node that holds a mesh, so every mesh
 * first moves into a child node of its own: the named nodes keep their origins, which the stage turns and lifts about
 * (`lid` sits on the rim, `lid-strap` swings on its hinge). The file is named after its content and the name
 * written to src/data/cup-model.json, so the site can cache it for good and a new model is a new URL.
 */
async function cupModel({ name: CUP, nodes: CUP_NODES }, io) {
  const doc = await io.read(kit(`3d/${CUP}.glb`));
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    if (node.getSkin() || mesh.listPrimitives().some((prim) => prim.listTargets().length)) {
      throw new Error(`${CUP}.glb: "${node.getName()}" is skinned or morphed; moving its mesh would break it.`);
    }
    node.addChild(doc.createNode(`${node.getName()}-mesh`).setMesh(mesh));
    node.setMesh(null);
  }
  // The stage draws the cups toon (src/lib/cup-scene/toon/cups.ts): of the textures only the prints (base colour) are
  // used. The grain and lid normal maps and the metal-roughness map are dropped, so phones neither download nor
  // decode them, and the prints are capped at 2048 px (a 4096 px print is ~32 MB of GPU memory once decoded).
  for (const material of doc.getRoot().listMaterials()) {
    material
      .setNormalTexture(null)
      .setMetallicRoughnessTexture(null)
      .setOcclusionTexture(null)
      .setEmissiveTexture(null);
  }
  await doc.transform(
    dedup(),
    prune({ keepLeaves: true }),
    textureCompress({ encoder: sharp, targetFormat: "webp", quality: 90, resize: [2048, 2048] }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  const names = new Set(
    doc
      .getRoot()
      .listNodes()
      .map((node) => node.getName()),
  );
  const missing = CUP_NODES.filter((name) => !names.has(name));
  if (missing.length) throw new Error(`${CUP}.glb has no ${missing.join(", ")} node: the 3D stage needs them.`);
  const glb = await io.writeBinary(doc);
  const hash = createHash("sha256").update(glb).digest("hex").slice(0, 8);
  const dir = out("public/models/.keep") && path.join(ROOT, "public", "models");
  for (const old of readdirSync(dir).filter((name) => name.startsWith(`${CUP}.`) && name.endsWith(".glb"))) {
    rmSync(path.join(dir, old));
  }
  write(`public/models/${CUP}.${hash}.glb`, glb);
  return `/models/${CUP}.${hash}.glb`;
}

/**
 * The menu board's pieces for the landing's menu section (the same look as brandkit-ghibli/thuc-don/thuc-don.pdf):
 * the featured cups (Blender toon renders, resized to 450 px wide WebP-ready PNGs) with their list, and the poster's
 * lookbook photo when there is one (as JPEG; some AI-made PNGs do not decode everywhere).
 */
async function menuBoard() {
  const { cups: featured, marks } = JSON.parse(readFileSync(langMay("thuc-don/featured.json"), "utf8"));
  rmSync(path.join(ROOT, "public/menu"), { recursive: true, force: true });
  for (const cup of featured) {
    await sharp(langMay(`thuc-don/ly/${cup.file}`))
      .resize({ width: 450 })
      .png({ compressionLevel: 9, palette: false })
      .toFile(out(`public/menu/ly/${cup.file}`));
    done(`public/menu/ly/${cup.file}`);
  }
  const poster = ["jpg", "jpeg", "png", "webp"]
    .map((ext) => path.join(LANGMAY, `thuc-don/lookbook/poster.${ext}`))
    .find(existsSync);
  if (poster) {
    await sharp(poster)
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out("public/menu/poster.jpg"));
    done("public/menu/poster.jpg");
  }
  // each group's heading mark: a painted monogram mark (brandkit-ghibli/scripts/monogram.py)
  for (const file of new Set(Object.values(marks))) {
    copyFileSync(langMay(`nhan-dien/monogram/${file}`), out(`public/menu/mark/${file}`));
    done(`public/menu/mark/${file}`);
  }
  write(
    "src/data/menu-featured.json",
    JSON.stringify({ cups: featured, marks, poster: Boolean(poster) }, null, 2) + "\n",
  );
}

async function cupModels() {
  await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
  const urls = {};
  for (const [key, cup] of Object.entries(CUPS)) urls[key] = await cupModel(cup, io);
  write("src/data/cup-model.json", JSON.stringify(urls, null, 2) + "\n");
}

const hex = tokens();
copy("nhan-dien/01-logo/bieu-tuong-hoa_den.svg", "src/assets/brand/hoa.svg");
copy("nhan-dien/03-hoa-tiet/monogram_hong.png", "src/assets/images/monogram-hong.png");
for (const [from, to] of [
  ["logo-ngang_hong.svg", "logo-ngang.svg"],
  ["hoa-low-poly_hong.svg", "hoa.svg"],
  ["hoa-ve-tay_hong.svg", "hoa-ve-tay.svg"],
  ["bien-may.svg", "bien-may.svg"],
  ["doi-che.svg", "doi-che.svg"],
]) {
  copyFileSync(langMay(`nhan-dien/${from}`), out(`src/assets/lang-may/${to}`));
  done(`src/assets/lang-may/${to}`);
}
await menuBoard();
await icons(hex);
await photos();
await cupModels();
for (const [from, to] of [
  ["menu-posm/print-ready/menu-data.json", "src/data/shanmay/menu-data.json"],
  ["collateral/collateral.json", "src/data/shanmay/collateral.json"],
]) {
  copyFileSync(shanmay(from), out(to));
  done(to);
}
console.log(`Đã đồng bộ từ ${KIT} và ${SHANMAY}`);
