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

// The cream on an open paper cup, as a stylized drink game asset draws a foam top. Both creams (milk foam, cheese foam)
// are one design since 22/10/2026 (the owner's choice): a thin, smooth cap that sits on the rolled rim (in the cup
// GLB's space: base at the origin, the rim round y = FOAM_RIM, outer radius 0.0466 m) and stays inside it, in the
// milk foam's cream colour, matte (no highlight, no rim light: the owner, 22/10/2026), sprinkled with dried rose
// petals and golden osmanthus.

/** The height of the cup's rolled rim: the cream's foot, and where it grows from in the carousel. */
export const FOAM_RIM = 0.1337;

/** A cap's profile (radius, height), from its foot on the rim to the top on the axis, smoothed by a spline. */
type Profile = ReadonlyArray<readonly [number, number]>;

/**
 * The cream cap, one design for both creams (the owner, 22/10/2026): a low, smooth swell that stays inside the rim
 * (its widest, 45 mm, sits on the rolled rim's top, whose outer radius is 46.6 mm), about 1 cm high, in the milk
 * foam's cream colour, dried rose petals and golden osmanthus on top.
 */
const CAP: Profile = [
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
/** The sprinkles: rose petals and osmanthus flecks over the top (inside `reach`, above the height `above`). */
const PETALS = { count: 16, size: [0.0058, 0.009] as const, reach: 0.034, above: 0.138 };
const OSMANTHUS = { count: 34, size: [0.0018, 0.003] as const, reach: 0.038, above: 0.138 };

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

function capGeometry(points: Vector2[]): BufferGeometry {
  const cap = new LatheGeometry(points, SMOOTH.sides);
  cap.deleteAttribute("uv");
  const welded = mergeVertices(cap, 1e-6); // one vertex at the lathe's seam: no crease down the cap
  cap.dispose();
  welded.computeVertexNormals();
  return welded;
}

/** The cream cap for an open paper cup (both creams); `seed` scatters its sprinkles differently. */
export function createFoam(seed = 5): Group {
  const random: Random = seeded(seed);
  const group = new Group();
  group.name = "foam";
  const points = profile(CAP);
  // matte: no highlight on the cream
  group.add(new Mesh(capGeometry(points), toonMaterial({ color: PROPS.foam, highlight: 0 })));
  group.add(petals(random, points), osmanthus(random, points));
  addOutlines(group, (mesh) => mesh instanceof InstancedMesh); // the sprinkles are too small for an outline
  group.traverse((object) => {
    if (object instanceof Mesh && !object.userData.outline) object.castShadow = object.receiveShadow = true;
  });
  return group;
}

/** Dried rose petals lying on the cap's top. */
function petals(random: Random, points: readonly Vector2[]): InstancedMesh {
  const mesh = new InstancedMesh(petalFlake(), toonMaterial({ highlight: 0 }), PETALS.count);
  const euler = new Euler();
  const matrix = new Matrix4();
  for (let i = 0; i < PETALS.count; i++) {
    const a = between(random, 0, Math.PI * 2);
    const r = PETALS.reach * Math.sqrt(random());
    const position = new Vector3(r * Math.cos(a), surface(points, r, PETALS.above) + 0.0008, r * Math.sin(a));
    const tilt = new Quaternion().setFromEuler(euler.set(between(random, -0.35, 0.35), random() * 6.28, 0));
    const size = between(random, ...PETALS.size);
    mesh.setMatrixAt(i, matrix.compose(position, tilt, new Vector3(size, size * 0.6, size)));
    mesh.setColorAt(i, new Color(pick(random, PROPS.petal)));
  }
  return mesh;
}

/** Dried osmanthus: many small gold flecks among the petals. */
function osmanthus(random: Random, points: readonly Vector2[]): InstancedMesh {
  const mesh = new InstancedMesh(puff(), toonMaterial({ highlight: 0 }), OSMANTHUS.count);
  const matrix = new Matrix4();
  const flat = new Quaternion();
  for (let i = 0; i < OSMANTHUS.count; i++) {
    const a = between(random, 0, Math.PI * 2);
    const r = OSMANTHUS.reach * Math.sqrt(random());
    const position = new Vector3(r * Math.cos(a), surface(points, r, OSMANTHUS.above) + 0.0005, r * Math.sin(a));
    const size = between(random, ...OSMANTHUS.size);
    mesh.setMatrixAt(i, matrix.compose(position, flat, new Vector3(size, size * 0.5, size)));
    mesh.setColorAt(i, new Color(pick(random, PROPS.osmanthus)));
  }
  return mesh;
}
