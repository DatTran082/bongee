import {
  type BufferGeometry,
  Color,
  Euler,
  Group,
  InstancedMesh,
  type Material,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import tokens from "@/data/brand-tokens.json";
import type { FlavorTopping } from "@/data/flavors";
import { between, pick, type Random } from "./random";
import { outlineColour, toonMaterial } from "./toon/material";
import { addOutlines } from "./toon/outline";
import { PROPS } from "./toon/palette";
import { bean, berry, cheeseWedge, flower, grapeBunch, ice, mango, petalFlake, puff } from "./toon/shapes";

// What floats round the cup in the flavour carousel, one set per flavour, as smooth toon shapes (toon/shapes.ts):
// five-petalled flowers for the flower teas, foam puffs and rose petals for the cream teas, grapes, mango and ice
// for the fruit teas, cheese and blackberries for the cheese-foam teas, coffee beans for the coffees. Each set hangs
// on a shell round the cup's middle (metres, in the cup's own space, so it turns and leans with the cup), slowly
// orbits, and gathers in from the cup or bursts away as its flavour comes and goes (its weight, 0 … 1, scales the
// whole set).

/** Where things hang: distance from the cup's axis and height about its middle. */
const SHELL = { radius: [0.068, 0.098] as const, y: [-0.09, 0.1] as const };
/** Orbit (radians per second) and bob (metres, hertz) of a whole set. */
const DRIFT = { orbit: 0.09, bob: 0.004, hz: 0.18 };

/** A shape, instanced, each copy `size` metres across and coloured from `colours`. */
interface Part {
  readonly geometry: BufferGeometry;
  readonly material: Material;
  readonly count: number;
  readonly size: readonly [number, number];
  readonly colours: readonly string[];
}

export interface ToppingSet {
  readonly group: Group;
  /** Lays the set out for its flavour's `weight` at `time` (s); `drift` lets it orbit and bob. */
  update(weight: number, time: number, drift: boolean): void;
}

export interface Toppings {
  /** every set, in the space of the cup's middle */
  readonly group: Group;
  readonly sets: Readonly<Record<FlavorTopping, ToppingSet>>;
  dispose(): void;
}

/** Overshoots a little on the way to 1, so a set lands with a small bounce. */
const easeOutBack = (t: number) => {
  const c = 1.4;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** Random places on the shell, turned every way, each `size` metres across. */
function placements(random: Random, count: number, size: readonly [number, number]): Matrix4[] {
  const euler = new Euler();
  return Array.from({ length: count }, () => {
    const a = between(random, 0, Math.PI * 2);
    const r = between(random, SHELL.radius[0], SHELL.radius[1]);
    const position = new Vector3(r * Math.cos(a), between(random, SHELL.y[0], SHELL.y[1]), r * Math.sin(a));
    const rotation = new Quaternion().setFromEuler(
      euler.set(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2),
    );
    const scale = new Vector3().setScalar(between(random, size[0], size[1]));
    return new Matrix4().compose(position, rotation, scale);
  });
}

function makeSet(random: Random, parts: readonly Part[], phase: number): ToppingSet {
  const group = new Group();
  for (const part of parts) {
    const transforms = placements(random, part.count, part.size);
    const mesh = new InstancedMesh(part.geometry, part.material, part.count);
    transforms.forEach((transform, i) => {
      mesh.setMatrixAt(i, transform);
      mesh.setColorAt(i, new Color(pick(random, part.colours)));
    });
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  addOutlines(group);
  group.visible = false;
  return {
    group,
    update(weight, time, drift) {
      group.visible = weight > 0.002;
      if (!group.visible) return;
      group.scale.setScalar(Math.max(0.001, easeOutBack(weight)));
      group.rotation.y = drift ? DRIFT.orbit * time + phase : phase;
      group.position.y = drift ? DRIFT.bob * Math.sin(2 * Math.PI * DRIFT.hz * time + phase) : 0;
    },
  };
}

export function createToppings(random: Random): Toppings {
  const materials = {
    solid: toonMaterial({ highlight: 0.8 }),
    painted: toonMaterial({ vertexColors: true, highlight: 0.5 }),
    ice: toonMaterial({ opacity: 0.55, highlight: 1, edge: outlineColour(tokens["sky-400"]) }),
    flake: toonMaterial({ highlight: 0.3, doubleSided: true }),
  };
  materials.ice.userData.noOutline = true; // see-through: its edge line is in the shader (toon/material.ts)
  materials.flake.userData.noOutline = true; // petal flakes: an outline would swallow them
  materials.painted.userData.outlineColour = outlineColour(PROPS.flower); // white petals: a rose outline, not grey
  const geometries = {
    flower: flower(PROPS.flower, PROPS.flowerHeart),
    puff: puff(),
    petal: petalFlake(),
    grapes: grapeBunch(),
    mango: mango(),
    ice: ice(),
    cheese: cheeseWedge(),
    berry: berry(random),
    bean: bean(),
  };
  const part = (
    geometry: BufferGeometry,
    material: Material,
    count: number,
    size: readonly [number, number],
    colours: readonly string[],
  ): Part => ({ geometry, material, count, size, colours });
  const sets: Record<FlavorTopping, ToppingSet> = {
    blossom: makeSet(random, [part(geometries.flower, materials.painted, 12, [0.026, 0.034], ["#ffffff"])], 0.3),
    cream: makeSet(
      random,
      [
        part(geometries.puff, materials.solid, 12, [0.01, 0.017], [PROPS.foam]),
        part(geometries.petal, materials.flake, 16, [0.009, 0.014], PROPS.petal),
      ],
      1.4,
    ),
    fruit: makeSet(
      random,
      [
        part(geometries.grapes, materials.solid, 6, [0.03, 0.036], PROPS.grape),
        part(geometries.mango, materials.solid, 3, [0.026, 0.032], PROPS.mango),
        part(geometries.ice, materials.ice, 4, [0.016, 0.02], [PROPS.ice]),
      ],
      2.2,
    ),
    cheese: makeSet(
      random,
      [
        part(geometries.cheese, materials.solid, 6, [0.022, 0.028], PROPS.cheese),
        part(geometries.berry, materials.solid, 7, [0.018, 0.024], PROPS.berry),
      ],
      3.1,
    ),
    coffee: makeSet(random, [part(geometries.bean, materials.solid, 16, [0.012, 0.016], PROPS.bean)], 4.4),
  };
  const group = new Group();
  group.name = "flavor-toppings";
  for (const set of Object.values(sets)) group.add(set.group);
  return {
    group,
    sets,
    dispose() {
      for (const m of Object.values(materials)) m.dispose();
      for (const g of Object.values(geometries)) g.dispose();
    },
  };
}
