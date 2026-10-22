import {
  type BufferGeometry,
  Color,
  Euler,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  Quaternion,
  SplineCurve,
  Vector2,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { between, pick, type Random, seeded } from "../random";
import { toonMaterial } from "./material";
import { addOutlines } from "./outline";
import { PROPS } from "./palette";
import { petalFlake, puff } from "./shapes";

// The cream on an open paper cup, as a stylized drink game asset draws a foam top: one smooth cap sitting on the
// rolled rim (in the cup GLB's space: base at the origin, the rim round y = FOAM_RIM, outer radius 0.0466 m), never
// past it. The milk foam is the first design's round dome; the cheese foam a low, smooth swell. Sprinkled on top:
// dried rose petals and osmanthus on the milk foam, mulberry flecks on the cheese foam.

/** The height of the cup's rolled rim: the cream's foot, and where it grows from in the carousel. */
export const FOAM_RIM = 0.1337;

/** A cap's profile (radius, height), from its foot on the rim to the top on the axis, smoothed by a spline. */
type Profile = ReadonlyArray<readonly [number, number]>;

/**
 * The milk foam, as first designed (brandkit/lookbook/prompts-anh-bia.md, "Chóp kem bông"; the realistic cap's own
 * profile): a round dome about 2.6 cm over the rim, its side rising almost straight from the rim before it rounds
 * over; drawn 7 % narrower than that first cap, so its widest (46.2 mm) stays on the rim (outer radius 46.6 mm).
 */
const BLOOM: Profile = [
  [0.0, 0.1348],
  [0.041, 0.1348],
  [0.0415, 0.1354],
  [0.0427, 0.1358],
  [0.0445, 0.1366],
  [0.0458, 0.1385],
  [0.0462, 0.141],
  [0.0451, 0.1442],
  [0.0423, 0.1482],
  [0.0377, 0.1522],
  [0.0312, 0.1557],
  [0.023, 0.1584],
  [0.0144, 0.16],
  [0.0058, 0.1608],
  [0.0, 0.161],
];
/**
 * The cheese foam: a low, smooth swell that stays inside the rim (its widest, 45 mm, sits on the rolled rim's top,
 * whose outer radius is 46.6 mm), about 1 cm high, as a cheese cap poured level and set.
 */
const CHEESE: Profile = [
  [0, 0.1346],
  [0.0436, 0.1346],
  [0.0448, 0.1354],
  [0.0452, 0.1366],
  [0.0448, 0.138],
  [0.0428, 0.1396],
  [0.0386, 0.1412],
  [0.0318, 0.1426],
  [0.0226, 0.1436],
  [0.0116, 0.1442],
  [0, 0.1444],
];
const SMOOTH = { rows: 40, sides: 64 }; // smooth at the cup's size, a third of the vertices of 64 × 96
/**
 * Each cream's look: its profile; the side's lobes (how many round it, how deep as a share of the radius, the height
 * they are deepest at, how far up and down they reach: none on the smooth cheese); its sprinkles' reach and height
 * above which they lie (the top, not the side).
 */
const STYLES = {
  bloom: {
    profile: BLOOM,
    lobes: { count: 6, depth: 0, y: 0.1475, spread: 0.0125 },
    sprinkles: { count: 20, size: [0.0058, 0.009] as const, reach: 0.036, above: 0.146 },
  },
  cheese: {
    profile: CHEESE,
    lobes: { count: 6, depth: 0, y: 0.14, spread: 0.01 },
    sprinkles: { count: 16, size: [0.0058, 0.009] as const, reach: 0.034, above: 0.138 },
  },
} as const;

export type FoamStyle = "bloom" | "cheese";

/** The smoothed profile, foot to top. */
function profile(points: Profile): Vector2[] {
  return new SplineCurve(points.map(([r, y]) => new Vector2(r, y))).getSpacedPoints(SMOOTH.rows);
}

/** The cap's top at `r` from the axis (for sprinkles to lie on it): the profile above `above`. */
function surface(points: readonly Vector2[], r: number, above: number): number {
  for (let i = points.length - 1; i > 0; i--) {
    const a = points[i];
    const b = points[i - 1];
    if (r >= Math.min(a.x, b.x) && r <= Math.max(a.x, b.x) && b.y > above) {
      return a.y + ((b.y - a.y) * (r - a.x)) / (b.x - a.x || 1);
    }
  }
  return points[points.length - 1].y;
}

function capGeometry(points: Vector2[], lobes: (typeof STYLES)[FoamStyle]["lobes"]): BufferGeometry {
  const cap = new LatheGeometry(points, SMOOTH.sides);
  cap.deleteAttribute("uv");
  const position = cap.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const angle = Math.atan2(z, x);
    const band = Math.exp(-(((y - lobes.y) / lobes.spread) ** 2)); // the lobes swell the side, not the foot or top
    const k = 1 + lobes.depth * band * Math.cos(lobes.count * angle);
    position.setXYZ(i, x * k, y, z * k);
  }
  const welded = mergeVertices(cap, 1e-6); // one vertex at the lathe's seam: no crease down the cap
  cap.dispose();
  welded.computeVertexNormals();
  return welded;
}

export function createFoam(style: FoamStyle = "bloom", seed = 5): Group {
  const random: Random = seeded(seed);
  const group = new Group();
  group.name = "foam";
  const look = STYLES[style];
  const points = profile(look.profile);
  const material = toonMaterial({ color: style === "bloom" ? PROPS.foam : PROPS.cheeseFoam, highlight: 0.55 });
  group.add(new Mesh(capGeometry(points, look.lobes), material));
  group.add(sprinkles(random, style, points));
  if (style === "bloom") group.add(osmanthus(random, points));
  addOutlines(group, (mesh) => mesh instanceof InstancedMesh); // the sprinkles are too small for an outline
  group.traverse((object) => {
    if (object instanceof Mesh && !object.userData.outline) object.castShadow = object.receiveShadow = true;
  });
  return group;
}

/** Petals or flecks lying on the cap's top. */
function sprinkles(random: Random, style: FoamStyle, points: readonly Vector2[]): InstancedMesh {
  const geometry = style === "bloom" ? petalFlake() : puff();
  const colours = style === "bloom" ? PROPS.petal : PROPS.fleck;
  const spec = STYLES[style].sprinkles;
  const mesh = new InstancedMesh(geometry, toonMaterial({ highlight: 0.4 }), spec.count);
  const euler = new Euler();
  const matrix = new Matrix4();
  for (let i = 0; i < spec.count; i++) {
    const a = between(random, 0, Math.PI * 2);
    const r = spec.reach * Math.sqrt(random());
    const position = new Vector3(r * Math.cos(a), surface(points, r, spec.above) + 0.0008, r * Math.sin(a));
    const tilt = new Quaternion().setFromEuler(euler.set(between(random, -0.35, 0.35), random() * 6.28, 0));
    const size = between(random, ...spec.size) * (style === "bloom" ? 1 : 0.55);
    mesh.setMatrixAt(i, matrix.compose(position, tilt, new Vector3(size, size * 0.6, size)));
    mesh.setColorAt(i, new Color(pick(random, colours)));
  }
  return mesh;
}

/** Dried osmanthus on the milk foam, as first designed: many small gold flecks among the petals. */
function osmanthus(random: Random, points: readonly Vector2[]): InstancedMesh {
  const spec = { count: 40, size: [0.0018, 0.003] as const, reach: 0.04, above: 0.144 };
  const mesh = new InstancedMesh(puff(), toonMaterial({ highlight: 0.3 }), spec.count);
  const matrix = new Matrix4();
  const flat = new Quaternion();
  for (let i = 0; i < spec.count; i++) {
    const a = between(random, 0, Math.PI * 2);
    const r = spec.reach * Math.sqrt(random());
    const position = new Vector3(r * Math.cos(a), surface(points, r, spec.above) + 0.0005, r * Math.sin(a));
    const size = between(random, ...spec.size);
    mesh.setMatrixAt(i, matrix.compose(position, flat, new Vector3(size, size * 0.5, size)));
    mesh.setColorAt(i, new Color(pick(random, PROPS.osmanthus)));
  }
  return mesh;
}
