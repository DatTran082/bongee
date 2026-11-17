// The hero garden's plants and rocks (a tree, rocks, grass, flowers) for the 3D stage: CC0 models from Quaternius's
// Stylized Nature MegaKit (free edition), kept in ../brandkit/3d-nature/quaternius-stylized-nature/ with their licence.
// Merged into one GLB, one root node per model (named after it), compressed for the web: normal maps dropped (the
// stage draws them toon), the painted textures as WebP capped at 1024 px, meshopt geometry. Named after its content
// (public/models/nature.<hash>.glb, cached immutable), its URL written to src/data/nature-model.json.
//
//   npm run sync-nature   (sync-brand runs it too)
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, mergeDocuments, meshopt, prune, textureCompress } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.resolve(ROOT, "../brandkit/3d-nature/quaternius-stylized-nature");

/** The models the stage uses (src/lib/cup-scene/garden.ts looks them up by these names). */
export const NATURE_MODELS = [
  "TwistedTree_1",
  "Rock_Medium_1",
  "Rock_Medium_2",
  "Bush_Common_Flowers",
  "Grass_Wispy_Short",
  "Grass_Wispy_Tall",
  "Fern_1",
  "Flower_3_Group",
  "Clover_1",
  "Pebble_Round_2",
];

export async function syncNature() {
  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
  const doc = new Document();
  doc.createBuffer();
  const scene = doc.createScene("nature");
  for (const name of NATURE_MODELS) {
    const source = await io.read(path.join(SOURCE, `${name}.gltf`));
    const roots = source
      .getRoot()
      .listScenes()
      .flatMap((s) => s.listChildren());
    const holder = source.createNode(name);
    for (const node of roots) holder.addChild(node);
    for (const s of source.getRoot().listScenes()) s.addChild(holder);
    const map = mergeDocuments(doc, source);
    scene.addChild(map.get(holder));
  }
  for (const s of doc.getRoot().listScenes()) if (s !== scene) s.dispose();
  doc.getRoot().setDefaultScene(scene);
  for (const buffer of doc.getRoot().listBuffers().slice(1)) buffer.dispose();
  const buffer = doc.getRoot().listBuffers()[0];
  for (const accessor of doc.getRoot().listAccessors()) accessor.setBuffer(buffer);
  for (const material of doc.getRoot().listMaterials()) {
    material.setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
  }
  await doc.transform(
    dedup(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp", quality: 82, resize: [1024, 1024] }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  const glb = await io.writeBinary(doc);
  const hash = createHash("sha256").update(glb).digest("hex").slice(0, 8);
  const dir = path.join(ROOT, "public", "models");
  mkdirSync(dir, { recursive: true });
  for (const old of readdirSync(dir).filter((f) => f.startsWith("nature.") && f.endsWith(".glb")))
    rmSync(path.join(dir, old));
  writeFileSync(path.join(dir, `nature.${hash}.glb`), glb);
  const url = `/models/nature.${hash}.glb`;
  writeFileSync(
    path.join(ROOT, "src/data/nature-model.json"),
    `${JSON.stringify({ url, models: NATURE_MODELS }, null, 2)}\n`,
  );
  console.log(`✓ nature: ${NATURE_MODELS.length} model → public${url} (${(glb.length / 1024).toFixed(0)} kB)`);
  return url;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await syncNature();
