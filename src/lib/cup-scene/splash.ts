import {
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { grapeTextures } from "./grape-textures";
import { PP_DRINK_LEVEL, PP_INSIDE } from "./pp-cup";
import { between, type Random } from "./random";

// What goes with the PP cup of grape tea, as in a drinks poster: green grapes (a few cut in half) and ice cubes
// standing in the tea, and more of them with water drops hanging in the air about the cup, drifting slowly round
// it and bobbing. `inside` is in the cup's own space (its base at the origin) so the tea refracts it; `group` is
// about the cup's middle, so it turns and leans with the cup.

const GRAPE = { radius: 0.0105, outside: 5, halves: 2, inside: 3, stem: "#8c6a3e", seed: "#9fae52" };
const ICE = { colour: "#eef8ff", size: 0.017, outside: 4, inside: 3 };
const DROPS = { count: 40, radius: { min: 0.0012, max: 0.0036 } };
/** Where things hang: distance from the cup's axis and height about its middle. */
const SHELL = { radius: { min: 0.068, max: 0.105 }, y: { min: -0.085, max: 0.105 } };
/** Drift: radians per second round the cup, metres of bob, hertz. */
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

interface GrapeMaterials {
  readonly skin: MeshPhysicalMaterial;
  readonly flesh: MeshStandardMaterial;
  readonly seed: MeshStandardMaterial;
  readonly stem: MeshStandardMaterial;
}

/** A grape: a slightly oval sphere in its textured skin with a short stem; a half shows its flesh and a seed. */
function grape(random: Random, half: boolean, m: GrapeMaterials): Group {
  const group = new Group();
  const r = GRAPE.radius * between(random, 0.85, 1.1);
  if (half) {
    const dome = new Mesh(new SphereGeometry(r, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2), m.skin);
    dome.scale.set(1, 1.1, 1);
    const flesh = new Mesh(new CircleGeometry(r * 0.985, 48), m.flesh);
    flesh.rotation.x = Math.PI / 2; // the cut face, looking down the stem axis
    const seed = new Mesh(new SphereGeometry(r * 0.2, 12, 8), m.seed);
    seed.scale.set(1, 0.3, 1.4);
    seed.position.y = 0.0003;
    group.add(dome, flesh, seed);
    group.rotation.set(between(random, -1.2, -0.4), between(random, 0, Math.PI * 2), 0); // the face toward the viewer-ish
  } else {
    const berry = new Mesh(new SphereGeometry(r, 48, 32), m.skin);
    berry.scale.set(1, 1.12, 1);
    const stem = new Mesh(new CylinderGeometry(0.0007, 0.0009, 0.004, 8), m.stem);
    stem.position.y = r * 1.12 + 0.0015;
    group.add(berry, stem);
    group.rotation.set(between(random, -0.6, 0.6), between(random, 0, Math.PI * 2), between(random, -0.5, 0.5));
  }
  return group;
}

/** A point in the tea, clear of the wall by `clearance`. */
function inTea(random: Random, clearance: number): Vector3 {
  const h = between(random, 0.03, PP_DRINK_LEVEL - 0.02);
  const r =
    (PP_INSIDE.radiusBottom + ((PP_INSIDE.radiusTop - PP_INSIDE.radiusBottom) * h) / PP_INSIDE.height - clearance) *
    Math.sqrt(random());
  const a = between(random, 0, Math.PI * 2);
  return new Vector3(r * Math.cos(a), h, r * Math.sin(a));
}

export function createSplash(random: Random): Splash {
  const group = new Group();
  group.name = "splash";
  const inside = new Group();
  inside.name = "in-the-tea";
  const maps = grapeTextures(random);
  const materials: GrapeMaterials = {
    skin: new MeshPhysicalMaterial({
      map: maps.map,
      roughnessMap: maps.roughnessMap,
      roughness: 1,
      bumpMap: maps.bumpMap,
      bumpScale: 0.0005,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      sheen: 0.35,
      sheenColor: "#dff0a0",
      sheenRoughness: 0.5,
    }),
    flesh: new MeshStandardMaterial({ map: maps.flesh, roughness: 0.35, side: DoubleSide }),
    seed: new MeshStandardMaterial({ color: GRAPE.seed, roughness: 0.6 }),
    stem: new MeshStandardMaterial({ color: GRAPE.stem, roughness: 0.8 }),
  };
  // ice in the air is clear (alpha); ice in the tea is drawn solid, frosted, so the tea's refraction can show it
  const iceAir = new MeshPhysicalMaterial({
    color: ICE.colour,
    transparent: true,
    opacity: 0.48,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.2,
    depthWrite: false,
  });
  const iceTea = new MeshPhysicalMaterial({
    color: ICE.colour,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
  });
  const water = new MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.6,
    roughness: 0.04,
    clearcoat: 1,
    envMapIntensity: 1.8,
    depthWrite: false,
  });
  for (const m of [iceAir, water, materials.skin]) m.userData.ownEnvMap = true; // their envMapIntensity counts (index.ts)

  const floaters: Floater[] = [];
  for (let i = 0; i < GRAPE.outside + GRAPE.halves; i++) {
    const object = grape(random, i >= GRAPE.outside, materials);
    group.add(object);
    floaters.push(floater(random, object));
  }
  const cube = new RoundedBoxGeometry(ICE.size, ICE.size, ICE.size, 3, ICE.size * 0.18);
  for (let i = 0; i < ICE.outside; i++) {
    const object = new Mesh(cube, iceAir);
    object.scale.set(between(random, 0.8, 1.15), between(random, 0.8, 1.15), between(random, 0.8, 1.15));
    object.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    object.renderOrder = 4;
    group.add(object);
    floaters.push(floater(random, object));
  }
  for (let i = 0; i < GRAPE.inside; i++) {
    const object = grape(random, false, materials);
    object.position.copy(inTea(random, GRAPE.radius * 1.3));
    inside.add(object);
  }
  for (let i = 0; i < ICE.inside; i++) {
    const object = new Mesh(cube, iceTea);
    object.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    object.position.copy(inTea(random, ICE.size * 0.9));
    inside.add(object);
  }
  const drops = new InstancedMesh(new SphereGeometry(1, 12, 10), water, DROPS.count);
  drops.renderOrder = 5;
  group.add(drops);
  const dropSpecs = Array.from({ length: DROPS.count }, () => ({
    ...floater(random, drops),
    size: between(random, DROPS.radius.min, DROPS.radius.max),
  }));
  const matrix = new Matrix4();
  const unit = new Quaternion();
  const position = new Vector3();
  const scale = new Vector3();

  const placeAt = (f: Floater, time: number, out: Vector3) => {
    const angle = f.angle + f.orbit * time;
    const bob = DRIFT.bob * Math.sin(2 * Math.PI * f.hz * time + f.phase);
    return out.set(f.radius * Math.cos(angle), f.y + bob, f.radius * Math.sin(angle));
  };

  let held = 0; // the time the layout was last laid out for
  const lay = (time: number, dt: number) => {
    for (const f of floaters) {
      placeAt(f, time, f.object.position);
      if (dt > 0 && f.object instanceof Mesh) f.object.rotateOnAxis(f.tumble, DRIFT.tumble * dt);
    }
    for (let i = 0; i < dropSpecs.length; i++) {
      const d = dropSpecs[i];
      placeAt(d, time, position);
      matrix.compose(position, unit, scale.setScalar(d.size));
      drops.setMatrixAt(i, matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
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
      for (const m of [iceAir, iceTea, water, ...Object.values(materials)]) m.dispose();
      maps.dispose();
      cube.dispose();
      drops.dispose();
      for (const root of [group, inside]) {
        root.traverse((object) => {
          if (object instanceof Mesh && object !== drops) object.geometry.dispose();
        });
      }
    },
  };
}
