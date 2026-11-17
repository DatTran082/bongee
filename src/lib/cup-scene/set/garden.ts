import {
  Box3,
  type ColorRepresentation,
  Group,
  LatheGeometry,
  type Material,
  Mesh,
  type Object3D,
  Vector2,
  Vector3,
} from "three";
import { between, seeded, wobble } from "../random";
import { toonMaterial } from "../toon/material";
import { addOutlines } from "../toon/outline";
import { FOOT } from "./layout";

// The hero garden (owner, 17/11/2026: "tìm asset … cel-shading", colourway B): the cover set stands on a small
// floating island, an old twisted tree leaning over it from behind, rocks, grass, a fern and flowers at its feet.
// The plants and rocks are CC0 models (Quaternius, Stylized Nature MegaKit: scripts/sync-nature.mjs), drawn with the
// stage's toon material and their painted textures repainted in the site's silver and pastel blue (`tint`): the brush
// strokes stay, the hues go. The island is drawn here. Added to the set after its actor has measured it, so the
// garden does not shrink the cups in their slot; it holds still with them.

/** The repaint colours, by what the model's material paints. */
const TINT = {
  crown: "#FFFFFF", // the tree's leaves: white, as plum blossom (the toon bands shade them silver)
  bark: "#9EA8B0",
  rock: "#D3DAE0",
  plant: "#C6D8E2", // grass, fern, bush: pastel blue-silver
  flower: "#FFFFFF",
  island: "#DCE4E9",
} as const;

interface Spot {
  readonly model: string;
  /** metres, in the set's space (y = 0: the boulder's top; the island's top at FOOT) */
  readonly x: number;
  readonly z: number;
  /** the model's height once placed, metres */
  readonly height: number;
  readonly turn: number;
}

const SPOTS: readonly Spot[] = [
  { model: "TwistedTree_1", x: 0.19, z: -0.2, height: 0.34, turn: 2.3 },
  { model: "Rock_Medium_1", x: -0.22, z: 0.0, height: 0.07, turn: 0.6 },
  { model: "Rock_Medium_2", x: 0.22, z: 0.07, height: 0.05, turn: 2.0 },
  { model: "Bush_Common_Flowers", x: 0.24, z: -0.07, height: 0.08, turn: 0.4 },
  { model: "Grass_Wispy_Tall", x: -0.17, z: 0.1, height: 0.08, turn: 1.1 },
  { model: "Grass_Wispy_Short", x: 0.12, z: 0.1, height: 0.045, turn: 0.2 },
  { model: "Fern_1", x: -0.25, z: -0.08, height: 0.06, turn: 0.9 },
  { model: "Flower_3_Group", x: -0.12, z: 0.13, height: 0.06, turn: 0.3 },
  { model: "Clover_1", x: 0.03, z: 0.13, height: 0.02, turn: 1.7 },
  { model: "Pebble_Round_2", x: 0.17, z: 0.15, height: 0.018, turn: 0.5 },
];

/** The island under everything: a flat top a little wider than the set, its underside a lumpy rock tapering away. */
const ISLAND = { radius: 0.31, depth: 0.12, x: -0.01, z: -0.03, seed: 61 };

function paint(name: string): { tint: ColorRepresentation; card: boolean } {
  if (/Leaves_TwistedTree/i.test(name)) return { tint: TINT.crown, card: true };
  if (/Bark/i.test(name)) return { tint: TINT.bark, card: false };
  if (/Rock|Pebble/i.test(name)) return { tint: TINT.rock, card: false };
  if (/Flower/i.test(name)) return { tint: TINT.flower, card: true };
  return { tint: TINT.plant, card: true }; // grass, leaves of bushes, ferns, clover
}

/** Swaps every material of a model for a tinted toon one (alpha-cut leaf cards, both sides, no outline). */
function toon(model: Object3D): void {
  const cache = new Map<Material, Material>();
  const meshes: Mesh[] = [];
  model.traverse((object) => object instanceof Mesh && meshes.push(object));
  for (const mesh of meshes) {
    const source = mesh.material as Material & { map?: import("three").Texture | null };
    let material = cache.get(source);
    if (!material) {
      const { tint, card } = paint(source.name);
      material = toonMaterial({
        map: source.map ?? null,
        tint,
        highlight: 0,
        alphaTest: card ? 0.5 : 0,
        doubleSided: card,
        name: `garden-${source.name}`,
      });
      material.userData.noOutline = card;
      cache.set(source, material);
    }
    mesh.material = material;
  }
}

/** One model placed on the island: scaled to its height, its foot on the island's top. */
function place(model: Object3D, spot: Spot): Object3D {
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const scale = spot.height / Math.max(size.y, 1e-6);
  const holder = new Group();
  holder.name = `garden-${spot.model}`;
  model.position.set(-((box.min.x + box.max.x) / 2), -box.min.y, -((box.min.z + box.max.z) / 2));
  holder.add(model);
  holder.scale.setScalar(scale);
  holder.position.set(spot.x, FOOT, spot.z);
  holder.rotation.y = spot.turn;
  return holder;
}

function island(): Mesh {
  const random = seeded(ISLAND.seed);
  const edge = wobble(random, 4, 0.04);
  const points: Vector2[] = [new Vector2(0, -ISLAND.depth)];
  for (let i = 1; i <= 10; i++) {
    const t = i / 10; // 0 at the tip, 1 at the rim
    const r = ISLAND.radius * Math.sin((t * Math.PI) / 2) ** 0.8 * (1 + between(random, -0.04, 0.04));
    points.push(new Vector2(r, -ISLAND.depth * (1 - t) ** 1.3));
  }
  points.push(new Vector2(ISLAND.radius * 0.97, 0.008), new Vector2(0, 0.012));
  const geometry = new LatheGeometry(points, 48);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = new Vector3().fromBufferAttribute(p, i);
    const k = 1 + edge(Math.atan2(v.z, v.x));
    p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, toonMaterial({ color: TINT.island, highlight: 0, name: "garden-island" }));
  mesh.position.set(ISLAND.x, FOOT, ISLAND.z);
  mesh.scale.set(1, 1, 0.72); // an oval, wider than deep, as the set is
  return mesh;
}

/** Builds the garden from the nature GLB's scene (one root node per model, named after it). */
export function createGarden(nature: Object3D): Group {
  const garden = new Group();
  garden.name = "garden";
  garden.add(island());
  for (const spot of SPOTS) {
    const source = nature.getObjectByName(spot.model);
    if (!source) throw new Error(`nature GLB has no "${spot.model}": run npm run sync-nature.`);
    const model = source.clone(true);
    toon(model);
    garden.add(place(model, spot));
  }
  addOutlines(garden); // the island, rocks and bark; leaf cards are left without (noOutline)
  return garden;
}
