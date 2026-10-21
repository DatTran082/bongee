import { Group, type Object3D } from "three";
import type { Flavor, FlavorCup } from "@/data/flavors";
import type { FlavorState } from "./flavor-track";
import { createFoam } from "./toon/foam";
import type { Toppings } from "./toppings";

// The flavour carousel's actor: the cup each flavour is served in (a lidded paper cup, a paper cup under milk foam
// or cheese foam, the clear PP cup of fruit tea; all toon, toon/), all at the same place, one shown at a time as the scroll moves
// through the flavours (flavor-track.ts), turning about its axis, with each flavour's toppings floating round it.

export interface FlavorRig {
  /** the actor's subject: the cups, centred on their base */
  readonly group: Group;
  /** the PP cup's copy, for what stands in its tea (added once its models have loaded) */
  readonly pp: Object3D;
  /** Hangs the toppings on the rig (they load after the stage shows); returns their group for the actor's pivot. */
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

/** A paper cup without its lid and its drink, under a foam dome. */
function foamed(paper: Object3D, style: "bloom" | "cheese"): Object3D {
  const cup = paper.clone(true);
  required(cup, "lid").removeFromParent();
  required(cup, "drink").removeFromParent();
  cup.add(createFoam(style));
  return cup;
}

/**
 * `paper` and `pp` are the stage's prepared models (materials made, the PP cup's tea and what stands in it added);
 * they are cloned, sharing geometry and materials.
 */
export function createFlavorRig(paper: Object3D, pp: Object3D, flavors: readonly Flavor[]): FlavorRig {
  const variants: Record<FlavorCup, Object3D> = {
    "paper-lidded": paper.clone(true),
    "paper-cream": foamed(paper, "bloom"),
    "paper-cheese": foamed(paper, "cheese"),
    pp: pp.clone(true),
  };
  const spinner = new Group(); // turns the cup about its axis
  for (const variant of Object.values(variants)) {
    variant.position.set(0, 0, 0);
    variant.rotation.set(0, 0, 0);
    spinner.add(variant);
  }
  const group = new Group();
  group.name = "flavor-cups";
  group.add(spinner);
  let toppings: Toppings | null = null;
  return {
    group,
    pp: variants.pp,
    setToppings(next) {
      toppings = next;
    },
    update(state, time, drift) {
      spinner.rotation.y = state.turn;
      const sizes: Record<FlavorCup, number> = { "paper-lidded": 0, "paper-cream": 0, "paper-cheese": 0, pp: 0 };
      flavors.forEach((flavor, i) => {
        sizes[flavor.cup] += state.cups[i] ?? 0;
        toppings?.sets[flavor.topping].update(state.toppings[i] ?? 0, time, drift);
      });
      for (const [cup, variant] of Object.entries(variants) as [FlavorCup, Object3D][]) {
        const size = Math.min(1, sizes[cup]);
        variant.visible = size > 0.002;
        variant.scale.setScalar(Math.max(0.001, size));
      }
    },
    dispose() {
      toppings?.dispose();
    },
  };
}
