import { Group, type Material, Mesh, type Object3D, Vector3 } from "three";
import tokens from "@/data/brand-tokens.json";
import { PP_DRINK_LEVEL, PP_INSIDE } from "./pp-cup";
import { between, pick, type Random } from "./random";
import { outlineColour, toonMaterial } from "./toon/material";
import { addOutlines } from "./toon/outline";
import { PROPS } from "./toon/palette";
import { grapeBunch, ice, puff } from "./toon/shapes";

// What goes with the PP cup of grape tea, as a stylized drink game asset shows it: round grape bunches and ice
// cubes (toon/shapes.ts) standing in the tea with a few bubbles rising in it, and more of them hanging in the air about the cup, drifting slowly
// round it and bobbing (no water drops: the owner had them taken out on 21/10/2026). `inside` is in the cup's own
// space (its base at the origin), so it stands in the tea; `group` is about the cup's middle, so it turns and leans
// with the cup.

/** Largest side (metres) and how many float outside and stand inside. */
const GRAPE = { size: [0.026, 0.032] as const, outside: 6, inside: 3 };
const ICE = { size: [0.016, 0.02] as const, outside: 4, inside: 3 };
/** Bubbles in the tea: how many, how big (metres). */
const BUBBLES = { count: 14, size: [0.0022, 0.0045] as const };
/** Where things hang: distance from the cup's axis and height about its middle. */
const SHELL = { radius: { min: 0.066, max: 0.098 }, y: { min: -0.085, max: 0.105 } };
/** Drift: radians per second round the cup, metres of bob, hertz, radians per second of tumble. */
const DRIFT = { orbit: { min: 0.04, max: 0.1 }, bob: 0.006, hz: { min: 0.12, max: 0.22 }, tumble: 0.35 };

interface Floater {
  readonly object: Object3D;
  readonly angle: number;
  readonly radius: number;
  readonly y: number;
  readonly orbit: number;
  readonly hz: number;
  readonly phase: number;
  readonly tumble: Vector3;
}

export interface Splash {
  /** floating about the cup, in the space of its middle */
  readonly group: Group;
  /** standing in the tea, in the cup's space */
  readonly inside: Group;
  /** Moves everything on by `dt` seconds (0 holds still) at `time` seconds. */
  update(time: number, dt: number): void;
  dispose(): void;
}

function floater(random: Random, object: Object3D): Floater {
  return {
    object,
    angle: between(random, 0, Math.PI * 2),
    radius: between(random, SHELL.radius.min, SHELL.radius.max),
    y: between(random, SHELL.y.min, SHELL.y.max),
    orbit: between(random, DRIFT.orbit.min, DRIFT.orbit.max) * (random() < 0.5 ? -1 : 1),
    hz: between(random, DRIFT.hz.min, DRIFT.hz.max),
    phase: between(random, 0, Math.PI * 2),
    tumble: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
  };
}

/** One shape, `size` metres across, turned at random. */
function piece(random: Random, make: () => Mesh, size: readonly [number, number]): Object3D {
  const mesh = make();
  mesh.scale.setScalar(between(random, size[0], size[1]));
  mesh.rotation.set(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2);
  return mesh;
}

/** A point in the tea, clear of the wall by `clearance`. */
function inTea(random: Random, clearance: number): Vector3 {
  const h = between(random, 0.03, PP_DRINK_LEVEL - 0.02);
  const wall = PP_INSIDE.radiusBottom + ((PP_INSIDE.radiusTop - PP_INSIDE.radiusBottom) * h) / PP_INSIDE.height;
  const r = (wall - clearance) * Math.sqrt(random());
  const a = between(random, 0, Math.PI * 2);
  return new Vector3(r * Math.cos(a), h, r * Math.sin(a));
}

export function createSplash(random: Random): Splash {
  const group = new Group();
  group.name = "splash";
  const inside = new Group();
  inside.name = "in-the-tea";
  const geometries = { grapes: grapeBunch(), ice: ice(), bubble: puff() };
  const materials: Record<string, Material[]> = {
    grapes: PROPS.grape.map((colour) => toonMaterial({ color: colour, highlight: 0.8 })),
    ice: [toonMaterial({ color: PROPS.ice, opacity: 0.55 })],
  };
  const maker = (geometry: keyof typeof geometries) => () =>
    new Mesh(geometries[geometry], pick(random, materials[geometry] as Material[]));

  const floaters: Floater[] = [];
  for (const [make, spec] of [
    [maker("grapes"), GRAPE],
    [maker("ice"), ICE],
  ] as const) {
    for (let i = 0; i < spec.outside; i++) {
      const object = piece(random, make, spec.size);
      group.add(object);
      floaters.push(floater(random, object));
    }
    for (let i = 0; i < spec.inside; i++) {
      const object = piece(random, make, spec.size);
      object.position.copy(inTea(random, spec.size[1] * 0.7));
      inside.add(object);
    }
  }
  materials.ice[0].userData.outlineColour = outlineColour(tokens["sky-400"]);
  const bubbles = toonMaterial({ color: PROPS.bubble, opacity: 0.75, highlight: 0 });
  bubbles.userData.noOutline = true;
  materials.bubbles = [bubbles];
  for (let i = 0; i < BUBBLES.count; i++) {
    const bubble = new Mesh(geometries.bubble, bubbles);
    bubble.scale.setScalar(between(random, ...BUBBLES.size));
    bubble.position.copy(inTea(random, BUBBLES.size[1]));
    inside.add(bubble);
  }
  addOutlines(group);
  addOutlines(inside);

  const placeAt = (f: Floater, time: number, out: Vector3) => {
    const angle = f.angle + f.orbit * time;
    const bob = DRIFT.bob * Math.sin(2 * Math.PI * f.hz * time + f.phase);
    return out.set(f.radius * Math.cos(angle), f.y + bob, f.radius * Math.sin(angle));
  };

  let held = 0; // the time the layout was last laid out for
  const lay = (time: number, dt: number) => {
    for (const f of floaters) {
      placeAt(f, time, f.object.position);
      if (dt > 0) f.object.rotateOnAxis(f.tumble, DRIFT.tumble * dt);
    }
    held = time;
  };
  lay(0, 0);

  return {
    group,
    inside,
    update(time, dt) {
      if (dt > 0) lay(time, dt);
      else if (held !== 0) lay(0, 0); // reduced motion: everything back to its resting place, once
    },
    dispose() {
      for (const g of Object.values(geometries)) g.dispose();
      for (const m of Object.values(materials).flat()) m.dispose();
    },
  };
}
