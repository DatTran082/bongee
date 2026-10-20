#!/usr/bin/env node
// Downloads the CC0 PBR textures the 3D stage's cover-photo set uses (src/lib/cup-scene/set/) from Poly Haven and
// re-encodes them for the web into public/textures/<asset>/{diffuse,normal,rough}.jpg (1k, JPEG q82). Run once
// (the files are committed): `node scripts/fetch-textures.mjs`. Licence: CC0 (https://polyhaven.com/license).
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Poly Haven asset ids → what the set uses them for (src/lib/cup-scene/set/materials.ts). */
const ASSETS = JSON.parse(process.env.TEXTURES ?? '["white_oak_veneer","plaster_grey_04"]');
/** Colour-map adjustments per asset (sharp modulate): the photo's sawn logs are paler and greyer than oak veneer. */
const ADJUST = { white_oak_veneer: { brightness: 1.32, saturation: 0.72 } };
const CHANNELS = { diffuse: "Diffuse", normal: "nor_gl", rough: "Rough" };
const SIZE = 1024;

for (const id of ASSETS) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const dir = path.join(ROOT, "public", "textures", id);
  mkdirSync(dir, { recursive: true });
  for (const [name, key] of Object.entries(CHANNELS)) {
    const entry = files[key]?.["1k"]?.jpg ?? files[key]?.["1k"]?.png;
    if (!entry) throw new Error(`${id}: không có kênh ${key} ở 1k`);
    const source = Buffer.from(await (await fetch(entry.url)).arrayBuffer());
    const out = path.join(dir, `${name}.jpg`);
    let image = sharp(source).resize(SIZE, SIZE, { fit: "cover" });
    if (name === "diffuse" && ADJUST[id]) image = image.modulate(ADJUST[id]);
    await image.jpeg({ quality: name === "normal" ? 90 : 82, mozjpeg: true }).toFile(out);
    console.log("ok:", path.relative(ROOT, out));
  }
}
