import { type Material, Mesh, MeshStandardMaterial, type Object3D } from "three";
import tokens from "@/data/brand-tokens.json";
import { outlineColour, toonMaterial } from "./material";
import { addOutlines } from "./outline";
import { type DrinkName, DRINKS } from "./palette";

// The brand kit's two cups (brandkit/3d) drawn as stylized game assets: kept round and smooth as modelled, every
// material swapped for a toon one by its name in the GLB, and outlined like a sticker. The paper keeps its print (the
// silver marks drawn flat, as the print files have them); the PP cup is clear plastic by alpha, no refraction, its
// tea poured in three greens with waving borders, the grapes, ice and bubbles inside showing through.

/** Draw order among the see-through parts: the tea first, the body over it, the lid over the body. */
const ORDER: Readonly<Record<string, number>> = {
  "milk-tea": 1,
  "pp-frosted": 2,
  "ink-white": 2,
  "lid-clear": 3,
  "lid-clear-plain": 4,
};

/** Opacity of the clear PP parts and of the tea. */
const CLEAR = { body: 0.28, lid: 0.34, tea: 0.88 };

export interface ToonCup {
  /** the drink's material: its colours can change with what the cup holds */
  readonly drink: Material;
}

/** A drink's outline in its own darkest layer's tone (its material is white, tinted by its layers in the shader). */
function drinkOutline<T extends Material>(material: T, colour: string): T {
  material.userData.outlineColour = outlineColour(colour);
  return material;
}

/** The clear plastic's edge line: the sky tint's outline tone. */
const CLEAR_EDGE = outlineColour(tokens["sky-400"]);

/** A see-through material: no outline hull (toon/outline.ts). */
function clear<T extends Material>(material: T): T {
  material.userData.noOutline = true;
  return material;
}

function swap(material: Material, tea: DrinkName, drink: DrinkShape): Material {
  const source = material instanceof MeshStandardMaterial ? material : null;
  const name = material.name;
  switch (name) {
    // paper is matte: a faint highlight (a bright one made the paper cup read as glass)
    case "paper":
      return toonMaterial({ name, color: tokens.cloud, highlight: 0.18 });
    case "paper-print":
      return toonMaterial({ name, color: tokens.cloud, map: source?.map ?? null, highlight: 0.18 });
    case "lid-white":
    case "lid-white-plain":
      return toonMaterial({ name, color: tokens["bg-alt"], highlight: 0.5 });
    // clear plastic: no outline hull (it would show through the wall as a solid band); its edge line is drawn in
    // the shader instead
    case "pp-frosted":
      return clear(
        toonMaterial({ name, color: tokens["sky-200"], opacity: CLEAR.body, doubleSided: true, edge: CLEAR_EDGE }),
      );
    case "lid-clear":
    case "lid-clear-plain":
      return clear(
        toonMaterial({ name, color: tokens["sky-200"], opacity: CLEAR.lid, doubleSided: true, edge: CLEAR_EDGE }),
      );
    case "ink-white":
      // the PP cup's white print lies on its clear wall: no hull (it would show through the wall as a band)
      return clear(toonMaterial({ name, color: tokens.cloud, map: source?.map ?? null, alphaTest: 0.5, highlight: 0 }));
    case "milk-tea":
      return drinkOutline(
        toonMaterial({
          name,
          color: "#ffffff",
          opacity: CLEAR.tea,
          layers: { colours: DRINKS[tea], y0: drink.y0, y1: drink.y1, axis: drink.axis },
          highlight: 0.6,
        }),
        DRINKS[tea][0],
      );
    default:
      return material;
  }
}

/** The drink's foot, top and axis in its mesh's own space (the GLB's are quantized: not metres). */
interface DrinkShape {
  readonly y0: number;
  readonly y1: number;
  readonly axis: readonly [number, number];
}

function drinkShape(root: Object3D): DrinkShape {
  let shape: DrinkShape = { y0: 0, y1: 1, axis: [0, 0] };
  root.traverse((object) => {
    if (!(object instanceof Mesh) || [object.material].flat()[0]?.name !== "milk-tea") return;
    object.geometry.computeBoundingBox();
    const box = object.geometry.boundingBox;
    if (box) {
      const axis = [(box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2] as const;
      shape = { y0: box.min.y, y1: box.max.y, axis };
    }
  });
  return shape;
}

/** Makes a cup model toon, in place (call once, before cloning: the clones share the geometry and the materials). */
export function toonCup(root: Object3D, tea: DrinkName): ToonCup {
  const drinkAt = drinkShape(root);
  const replaced = new Map<Material, Material>();
  let drink: Material | null = null;
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = [object.material].flat().map((material) => {
      let next = replaced.get(material);
      if (!next) {
        next = swap(material, tea, drinkAt);
        replaced.set(material, next);
        if (next !== material) material.dispose();
      }
      if (next.name === "milk-tea") drink = next;
      return next;
    });
    object.material = Array.isArray(object.material) ? materials : materials[0];
    object.renderOrder = Math.max(...materials.map((m) => ORDER[m.name] ?? 0));
    object.castShadow = object.receiveShadow = true;
  });
  if (!drink)
    throw new Error('The cup model has no "milk-tea" material: rebuild brandkit/3d and run npm run sync-brand.');
  addOutlines(root);
  return { drink };
}
