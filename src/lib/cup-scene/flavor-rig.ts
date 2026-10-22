import { Box3, Group, type Object3D } from "three";
import type { Flavor, FlavorCup } from "@/data/flavors";
import { type CupBody, type CupKind, cupParts, type CupTopper, type FlavorState } from "./flavor-track";
import { createFoam, FOAM_RIM } from "./toon/foam";
import type { Toppings } from "./toppings";

// The flavour carousel's actor: the cup each flavour is served in, at one place, turning about its axis as the
// scroll moves through the flavours (flavor-track.ts), with each flavour's toppings floating round it. The paper cup
// is one body with its toppers on it (its lid, a milk-foam cream, a cheese cream): between two paper-cup flavours it
// stays and only the topper changes (cupParts); the clear PP cup of the fruit teas and the clear PET cup of the
// coffees (toon/pet-cup.ts) take the paper cup's place whole.

/** How far (metres) a topper lifts off as it goes, or drops from as it comes. */
const TOPPER_LIFT = 0.035;

const KINDS: Readonly<Record<FlavorCup, CupKind>> = {
  "paper-lidded": { body: "paper", topper: "lid" },
  "paper-cream": { body: "paper", topper: "cream" },
  "paper-cheese": { body: "paper", topper: "cheese" },
  pp: { body: "pp", topper: "none" },
  pet: { body: "pet", topper: "none" },
};

export interface FlavorRig {
  /** the actor's subject: the cups, centred on their base */
  readonly group: Group;
  /** the PP cup's copy, for what stands in its tea (added once its models have loaded) */
  readonly pp: Object3D;
  /** Hangs the toppings on the rig (they are made after the stage shows). */
  setToppings(toppings: Toppings): void;
  /** Lays the rig out for the carousel's state at `time` (s). */
  update(state: FlavorState, time: number, drift: boolean): void;
  dispose(): void;
}

function required(root: Object3D, name: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`The cup model has no "${name}" node: rebuild brandkit/3d and run npm run sync-brand.`);
  return node;
}

/**
 * A whole cup in a holder at its middle, so it grows and shrinks about its middle, not its foot (which would carry
 * a shrinking cup down out of the frame).
 */
function holder(cup: Object3D): Group {
  cup.position.set(0, 0, 0);
  cup.rotation.set(0, 0, 0);
  const box = new Box3().setFromObject(cup);
  const middle = (box.min.y + box.max.y) / 2;
  const held = new Group();
  held.position.y = middle;
  cup.position.y = -middle;
  held.add(cup);
  return held;
}

/** A cream on the rim: wrapped so that it grows and shrinks about the rim, not the cup's foot. */
function cream(seed: number): Group {
  const holder = new Group();
  holder.position.y = FOAM_RIM;
  const foam = createFoam(seed);
  foam.position.y = -FOAM_RIM;
  holder.add(foam);
  return holder;
}

/**
 * `paper` and `pp` are the stage's prepared models (toon materials, the PP cup's tea and what stands in it added);
 * they are cloned, sharing geometry and materials. `pet` is the carousel's own PET cup (used as it is).
 */
export function createFlavorRig(paper: Object3D, pp: Object3D, pet: Object3D, flavors: readonly Flavor[]): FlavorRig {
  const paperBody = paper.clone(true);
  const lid = required(paperBody, "lid");
  const toppers: Record<Exclude<CupTopper, "none">, { object: Object3D; restY: number }> = {
    lid: { object: lid, restY: lid.position.y },
    cream: { object: cream(5), restY: FOAM_RIM },
    cheese: { object: cream(9), restY: FOAM_RIM }, // the same cap, its sprinkles scattered apart
  };
  paperBody.add(toppers.cream.object, toppers.cheese.object);
  const ppCup = pp.clone(true);
  const bodies: Record<CupBody, Object3D> = { paper: holder(paperBody), pp: holder(ppCup), pet: holder(pet) };
  const spinner = new Group(); // turns the cup about its axis
  for (const body of Object.values(bodies)) spinner.add(body);
  const group = new Group();
  group.name = "flavor-cups";
  group.add(spinner);
  const kinds = flavors.map((flavor) => KINDS[flavor.cup]);
  let toppings: Toppings | null = null;

  const show = (object: Object3D, size: number) => {
    object.visible = size > 0.002;
    object.scale.setScalar(Math.max(0.001, size));
  };
  /** A whole cup never shrinks below half: it goes from half size to gone, so it never dwindles to a speck. */
  const showBody = (object: Object3D, size: number) => show(object, size > 0.002 ? 0.5 + 0.5 * size : 0);

  return {
    group,
    pp: ppCup, // the cup itself, not its holder: what stands in the tea goes in the cup's own space
    setToppings(next) {
      toppings = next;
    },
    update(state, time, drift) {
      spinner.rotation.y = state.turn;
      const parts = cupParts(state, kinds);
      for (const body of ["paper", "pp", "pet"] as const) showBody(bodies[body], parts.bodies[body]);
      for (const [name, topper] of Object.entries(toppers) as [keyof typeof toppers, (typeof toppers)["lid"]][]) {
        const { size, lift } = parts.toppers[name];
        show(topper.object, size);
        topper.object.position.y = topper.restY + lift * TOPPER_LIFT;
      }
      flavors.forEach((flavor, i) => {
        toppings?.sets[flavor.topping].update(state.toppings[i] ?? 0, time, drift);
      });
    },
    dispose() {
      toppings?.dispose();
    },
  };
}
