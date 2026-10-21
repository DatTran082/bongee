import { Group, Mesh, type Object3D } from "three";
import { seeded } from "../random";
import { createFoam } from "../toon/foam";
import { outlineColour, toonMaterial } from "../toon/material";
import { addOutlines } from "../toon/outline";
import { PROPS } from "../toon/palette";
import { boulder, cloud, log } from "../toon/shapes";
import { CLOUDS, FOOT, LIDDED_CUP, LOGS, OPEN_CUP, type Placement } from "./layout";

// The cover photo's set, as a stylized game scene: the brand kit's paper cup twice (one under a two-tier foam
// sprinkled with rose petals, one lidded) on low-poly props drawn here (toon/shapes.ts): a pale boulder under the
// open cup, a sawn log under the lidded cup with a shorter one behind, and two small clouds drifting behind them (the
// Làng Mây edition's accent: "trà mọc trên núi cao, nơi mây phủ quanh năm"). No plants or flowers. It floats as one
// piece: the boulder and the logs end at FOOT (layout.ts).

/** The boulder's box (metres): its flat top a little under y = 0, where the open cup stands; its centre; its turn. */
const STONE = { width: 0.3, height: -FOOT, depth: 0.22, x: -0.075, z: 0.027, sink: 0.002, turn: 0.35 };
const SEED = 31;

export interface CupSet {
  readonly group: Group;
  /** the clouds: hung on the set's actor (decorate), so they float behind without counting in its size */
  readonly clouds: Group;
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
    if (child instanceof Mesh && !child.userData.outline) child.castShadow = child.receiveShadow = true;
  });
}

/** Builds the set from the (toon) paper cup model, cloned twice: geometry and materials shared. */
export function createSet(paper: Object3D): CupSet {
  const random = seeded(SEED);
  const open = paper.clone(true);
  required(open, "lid").removeFromParent();
  required(open, "drink").removeFromParent(); // under the foam
  open.add(createFoam("bloom"));
  const lidded = paper.clone(true);
  const lid = required(lidded, "lid");
  const strap = required(lidded, "lid-strap");

  const stone = new Mesh(
    boulder(random, STONE.width, STONE.height, STONE.depth),
    toonMaterial({ color: PROPS.stone, highlight: 0.5 }),
  );
  stone.position.set(STONE.x, -STONE.sink, STONE.z);
  stone.rotation.y = STONE.turn;
  const wood = toonMaterial({ vertexColors: true, highlight: 0.4 });
  wood.userData.outlineColour = outlineColour(PROPS.bark);
  const logs = LOGS.map((spec, i) => {
    const mesh = new Mesh(
      log(random, spec.radius, spec.top - FOOT, { bark: PROPS.bark, cut: PROPS.cut, ring: PROPS.cutRing }),
      wood,
    );
    mesh.position.set(spec.x, FOOT, spec.z);
    mesh.rotation.y = i * 2.1;
    return mesh;
  });
  const props = new Group();
  props.add(stone, ...logs);
  addOutlines(props);
  shadows(props);
  shadows(open);
  shadows(lidded);

  const sky = new Group();
  sky.name = "clouds";
  const cloudMaterial = toonMaterial({ color: PROPS.cloud, highlight: 0 });
  for (const spec of CLOUDS) {
    const puff = new Mesh(cloud(random), cloudMaterial);
    puff.scale.set(spec.size, spec.size * 0.75, spec.size * 0.6);
    puff.position.set(spec.x, spec.y, spec.z);
    sky.add(puff);
  }
  addOutlines(sky);

  const group = new Group();
  group.name = "cover-set";
  group.add(props, place(open, OPEN_CUP), place(lidded, LIDDED_CUP));
  return { group, clouds: sky, lid, strap };
}
