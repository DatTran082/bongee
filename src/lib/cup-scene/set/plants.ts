import {
  CatmullRomCurve3,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { between, type Random, seeded } from "../random";
import { BUD, BUD_STEM, FOOT, VINE } from "./layout";
import { PLANT } from "./palette";

// The plants of the cover photo: on the left a thin green stem that curls up from the block to a round, spiky bud;
// on the right a vine that stands behind the logs with a few drooping leaves and small white double jasmine. Thin
// tubes along smooth curves, a displaced sphere for the bud, flat shapes for the leaves, clustered spheres for the
// flowers. Metres, in the set's coordinates.

const STEM_RADIUS = 0.00125;
const VINE_RADIUS = 0.0017;

function tube(points: readonly Vector3[], radius: number, material: MeshStandardMaterial, segments = 48): Mesh {
  const curve = new CatmullRomCurve3([...points], false, "centripetal");
  const mesh = new Mesh(new TubeGeometry(curve, segments, radius, 7, false), material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** The round bud: a sphere with its vertices pushed out unevenly, so it reads as a knobbly globe. */
function bud(random: Random): Mesh {
  const geometry = new IcosahedronGeometry(BUD.radius, 3);
  const position = geometry.getAttribute("position");
  const v = new Vector3();
  for (let i = 0; i < position.count; i++) {
    v.set(position.getX(i), position.getY(i), position.getZ(i));
    const spike = Math.pow(random(), 3) * BUD.spikes; // most knobs small, a few stand out
    v.setLength(BUD.radius + spike);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: PLANT.bud, roughness: 0.85, flatShading: true }));
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** A leaf blade: a pointed ellipse, a little asymmetric, in the x–y plane with its stalk end at the origin. */
function leafGeometry(length: number, random: Random): ShapeGeometry {
  const shape = new Shape();
  const half = length * between(random, 0.17, 0.21);
  shape.moveTo(0, 0);
  shape.bezierCurveTo(length * 0.2, half * 1.1, length * 0.7, half * 0.9, length, 0);
  shape.bezierCurveTo(length * 0.7, -half * 0.8, length * 0.2, -half, 0, 0);
  const geometry = new ShapeGeometry(shape, 12);
  // a gentle fold along the midrib and a droop toward the tip
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, Math.abs(y) * 0.35 - (x / length) * (x / length) * length * 0.18);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** A small double jasmine: a round white head of overlapping balls, on a thin side stem. */
function jasmine(random: Random, petal: MeshStandardMaterial, heart: MeshStandardMaterial): Group {
  const flower = new Group();
  const core = new Mesh(new SphereGeometry(0.0042, 14, 10), petal);
  core.scale.set(1, 0.85, 1);
  flower.add(core);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + between(random, -0.2, 0.2);
    const r = between(random, 0.0028, 0.0036);
    const ball = new Mesh(new SphereGeometry(between(random, 0.0017, 0.0023), 10, 8), i % 3 ? petal : heart);
    ball.position.set(r * Math.cos(a), between(random, -0.0015, 0.002), r * Math.sin(a));
    flower.add(ball);
  }
  const calyx = new Mesh(new SphereGeometry(0.0016, 8, 6), new MeshStandardMaterial({ color: PLANT.stemLight }));
  calyx.position.y = -0.0038;
  flower.add(calyx);
  flower.traverse((object) => {
    if (object instanceof Mesh) object.castShadow = object.receiveShadow = true;
  });
  return flower;
}

/** The curly stem with its bud, over the block on the left. */
export function createBudStem(): Group {
  const random = seeded(53);
  const group = new Group();
  group.name = "bud-stem";
  const stem = new MeshStandardMaterial({ color: PLANT.stem, roughness: 0.7 });
  const points = BUD_STEM.map(([x, y, z]) => new Vector3(x, y, z));
  group.add(tube(points, STEM_RADIUS, stem, 64));
  const head = bud(random);
  const tip = points[points.length - 1];
  head.position.copy(tip).add(new Vector3(0.002, BUD.radius * 0.8, 0));
  group.add(head);
  return group;
}

/** The vine behind the logs on the right: the stem, its leaves and its white flowers. */
export function createVine(): Group {
  const random = seeded(61);
  const group = new Group();
  group.name = "vine";
  const stem = new MeshStandardMaterial({ color: PLANT.stem, roughness: 0.7 });
  const leafMaterial = new MeshPhysicalMaterial({
    color: PLANT.leaf,
    roughness: 0.55,
    sheen: 0.4,
    sheenRoughness: 0.6,
    sheenColor: PLANT.leafBack,
    side: DoubleSide,
  });
  const petal = new MeshStandardMaterial({ color: PLANT.jasmine, roughness: 0.6 });
  const heart = new MeshStandardMaterial({ color: PLANT.jasmineHeart, roughness: 0.7 });

  // the stem: up from the foot, wavering a little, leaning right near the top
  const steps = 7;
  const spine = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const y = FOOT + (VINE.top - FOOT) * t;
    return new Vector3(VINE.x + 0.006 * Math.sin(t * 5.2) + 0.012 * t * t, y, VINE.z + 0.005 * Math.sin(t * 3.1 + 1));
  });
  const curve = new CatmullRomCurve3(spine, false, "centripetal");
  group.add(tube(spine, VINE_RADIUS, stem, 72));
  const at = (height: number) => curve.getPointAt(Math.min(1, Math.max(0, (height - FOOT) / (VINE.top - FOOT))));

  for (const [height, length, droop] of VINE.leaves) {
    // a short petiole out of the stem to the right, then the blade hanging from it
    const base = at(height);
    const end = base.clone().add(new Vector3(0.012, -0.004, between(random, -0.004, 0.004)));
    group.add(tube([base, end], STEM_RADIUS * 0.7, stem, 6));
    const leaf = new Mesh(leafGeometry(length, random), leafMaterial);
    leaf.position.copy(end);
    leaf.rotation.set(between(random, -0.3, 0.3), between(random, -0.35, 0.1), -droop);
    leaf.castShadow = leaf.receiveShadow = true;
    group.add(leaf);
  }

  for (const [height, reach, drop] of VINE.flowers) {
    const base = at(height);
    const mid = base.clone().add(new Vector3(reach * 0.6, drop * 0.1, 0.004));
    const end = base.clone().add(new Vector3(reach, -drop, 0.006));
    group.add(tube([base, mid, end], STEM_RADIUS * 0.6, stem, 12));
    const flower = jasmine(random, petal, heart);
    flower.position.copy(end).add(new Vector3(0, -0.004, 0));
    flower.rotation.set(between(random, -0.4, 0.4), random() * Math.PI * 2, between(random, -0.3, 0.3));
    group.add(flower);
  }
  return group;
}
