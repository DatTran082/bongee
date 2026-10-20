import {
  Color,
  Group,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  Vector3,
} from "three";
import { createCream } from "./cream";
import { LIDDED_CUP, LILY, LILY_FACING, LOGS, OPEN_CUP, type Placement } from "./layout";
import { createLily } from "./lily";
import { createBudStem, createVine } from "./plants";
import { createLog, createStone } from "./props";

// The cover photo's set, built in three.js from the brand kit's paper cup and props drawn in code: the open cup
// wearing a cream dome sprinkled with dried petals on a granite block, the lidded cup on a tall log with a short log
// behind, a white lily at the tall log's front edge, a curly stem with a round bud on the left, a vine with leaves
// and white jasmine on the right. It floats as one piece: the block and the logs have feet (layout.ts, FOOT).

/** How much of the environment the metallic ink reflects (the paper takes 1): light satin silver, not grey. */
const PRINT_SHEEN = 1.6;

export interface CupSet {
  readonly group: Group;
  /** the lidded cup's lid (a tap on it flips the strap) and its strap */
  readonly lid: Object3D;
  readonly strap: Object3D;
}

function required(root: Object3D, name: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node)
    throw new Error(`The paper cup model has no "${name}" node: rebuild brandkit/3d and run npm run sync-brand.`);
  return node;
}

function place<T extends Object3D>(object: T, at: Placement): T {
  object.position.set(at.x, at.y, at.z);
  object.rotation.y = at.turn;
  return object;
}

function shadows(object: Object3D): void {
  object.traverse((child) => {
    if (child instanceof Mesh) child.castShadow = child.receiveShadow = true;
  });
}

/** The paper cup's surfaces, warm and a little rough, with the sheen of paper fibre. */
const PAPER = { tint: "#fdf9f2", roughness: 0.9, sheen: 0.32, sheenRoughness: 0.85, sheenColour: "#fff9ee" };

/**
 * Gives the paper cup's surfaces the look of real board (sheen, warmth) and its silver print its sheen; the
 * materials are shared by every clone, so once is enough. Each GLB material becomes a physical one in place.
 */
export function preparePaper(paper: Object3D): void {
  const done = new Map<Material, Material>();
  paper.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = [object.material].flat().map((material) => {
      const made = done.get(material);
      if (made) return made;
      if (!(material instanceof MeshStandardMaterial) || !material.name.startsWith("paper")) return material;
      const physical = new MeshPhysicalMaterial();
      // copy the standard material's own fields only: MeshPhysicalMaterial.copy expects a physical source
      MeshStandardMaterial.prototype.copy.call(physical, material);
      physical.name = material.name;
      physical.color.multiply(new Color(PAPER.tint));
      if (!physical.roughnessMap) physical.roughness = PAPER.roughness;
      physical.sheen = PAPER.sheen;
      physical.sheenRoughness = PAPER.sheenRoughness;
      physical.sheenColor.set(PAPER.sheenColour);
      if (physical.metalnessMap) {
        physical.envMapIntensity = PRINT_SHEEN; // the silver ink is metal: let it take more of the environment
        physical.userData.ownEnvMap = true; // counts only with its own envMap (index.ts, environment())
      }
      done.set(material, physical);
      material.dispose();
      return physical;
    });
    object.material = Array.isArray(object.material) ? materials : materials[0];
  });
}

/**
 * Builds the set from the paper cup model (cloned twice; geometry and materials shared). The props' PBR textures
 * load after the build; `onTexture` is called as each lands, for a frame.
 */
export function createSet(paper: Object3D, onTexture: () => void): CupSet {
  const open = paper.clone(true);
  required(open, "lid").removeFromParent();
  required(open, "drink").removeFromParent(); // under the cream
  open.add(createCream());
  const lidded = paper.clone(true);
  const lid = required(lidded, "lid");
  const strap = required(lidded, "lid-strap");
  const lily = place(createLily(), LILY);
  lily.quaternion
    .setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...LILY_FACING).normalize())
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), LILY.turn));
  const group = new Group();
  group.name = "cover-set";
  group.add(
    createStone(onTexture),
    ...LOGS.map((log) => createLog(log, onTexture)),
    place(open, OPEN_CUP),
    place(lidded, LIDDED_CUP),
    lily,
  );
  group.add(createBudStem(), createVine());
  shadows(group);
  return { group, lid, strap };
}
