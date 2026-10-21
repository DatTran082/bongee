import {
  Color,
  Curve,
  Euler,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  Quaternion,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { between, pick, type Random, seeded } from "../random";
import { toonMaterial } from "./material";
import { addOutlines } from "./outline";
import { PROPS } from "./palette";
import { petalFlake, puff } from "./shapes";

// The cream on an open paper cup, as a stylized drink game asset draws whipped cream: a soft-serve swirl, a plump
// rope of cream wound two and a half times up from a low dome that rests on the rolled rim (in the cup GLB's space:
// base at the origin, the rim round y = 0.1337 m, outer radius 0.0466 m), thinning to a tip; sprinkled with dried
// rose petals on the milk foam, mulberry flecks on the cheese foam.

/** The dome on the rim (radius, height), from its flat underside to the axis. */
const DOME: ReadonlyArray<readonly [number, number]> = [
  [0, 0.1348],
  [0.044, 0.1348],
  [0.0478, 0.1362],
  [0.0494, 0.1388],
  [0.0486, 0.1412],
  [0.044, 0.1432],
  [0.02, 0.1446],
  [0, 0.1448],
];
/** The swirl: turns, its rope's path (radius and height at its start and end) and thickness (start → end). */
const SWIRL = {
  turns: 2.6,
  radius: [0.034, 0.003] as const,
  y: [0.1452, 0.1705] as const,
  rope: [0.0118, 0.0058] as const,
  /** the rope is a little flattened, so the turns stack like piped cream */
  squash: 0.78,
  segments: 220,
  sides: 18,
};
const SPRINKLES = { count: 24, size: [0.0055, 0.0085] as const };

export type FoamStyle = "bloom" | "cheese";

const lerp = (range: readonly [number, number], t: number) => range[0] + (range[1] - range[0]) * t;

/** The swirl's centre line at t ∈ [0, 1]. */
class Swirl extends Curve<Vector3> {
  constructor() {
    super(); // Curve's own constructor is protected
  }

  getPoint(t: number, target = new Vector3()): Vector3 {
    const a = t * SWIRL.turns * Math.PI * 2;
    const r = lerp(SWIRL.radius, Math.pow(t, 0.8));
    return target.set(r * Math.cos(a), lerp(SWIRL.y, Math.pow(t, 0.9)), r * Math.sin(a));
  }
}

const ropeAt = (t: number) => lerp(SWIRL.rope, t);

/** The rope round the swirl, thinning along it and squashed upright; its far end closed by a round tip. */
function swirlGeometry(): TubeGeometry {
  const path = new Swirl();
  const tube = new TubeGeometry(path, SWIRL.segments, 1, SWIRL.sides, false);
  const position = tube.getAttribute("position");
  const centre = new Vector3();
  const p = new Vector3();
  for (let ring = 0; ring <= SWIRL.segments; ring++) {
    const t = ring / SWIRL.segments;
    path.getPointAt(t, centre);
    // the first turn swells out of the dome, the last tapers into the tip
    const k = ropeAt(t) * Math.min(1, 0.35 + t * 12) * Math.min(1, (1 - t) * 30 + 0.25);
    for (let side = 0; side <= SWIRL.sides; side++) {
      const i = ring * (SWIRL.sides + 1) + side;
      p.fromBufferAttribute(position, i).sub(centre).multiplyScalar(k);
      p.y *= SWIRL.squash;
      position.setXYZ(i, centre.x + p.x, centre.y + p.y, centre.z + p.z);
    }
  }
  tube.computeVertexNormals();
  return tube;
}

export function createFoam(style: FoamStyle = "bloom", seed = 5): Group {
  const random: Random = seeded(seed);
  const group = new Group();
  group.name = "foam";
  const material = toonMaterial({ color: style === "bloom" ? PROPS.foam : PROPS.cheeseFoam, highlight: 0.7 });
  const dome = new LatheGeometry(
    DOME.map(([r, y]) => new Vector2(r, y)),
    48,
  );
  dome.deleteAttribute("uv");
  const tip = new IcosahedronGeometry(1, 3);
  tip.scale(SWIRL.rope[1] * 0.9, SWIRL.rope[1] * 1.1, SWIRL.rope[1] * 0.9);
  const end = new Swirl().getPoint(1);
  tip.translate(end.x, end.y + SWIRL.rope[1] * 0.3, end.z);
  group.add(
    new Mesh(mergeVertices(dome, 1e-6), material),
    new Mesh(swirlGeometry(), material),
    new Mesh(tip, material),
  );
  for (const mesh of group.children as Mesh[]) mesh.geometry.computeVertexNormals();
  group.add(sprinkles(random, style));
  addOutlines(group, (mesh) => mesh instanceof InstancedMesh); // the sprinkles are too small for an outline
  group.traverse((object) => {
    if (object instanceof Mesh && !object.userData.outline) object.castShadow = object.receiveShadow = true;
  });
  return group;
}

/** Petals or flecks lying on the swirl's rope, on its outer, upper side. */
function sprinkles(random: Random, style: FoamStyle): InstancedMesh {
  const geometry = style === "bloom" ? petalFlake() : puff();
  const colours = style === "bloom" ? PROPS.petal : PROPS.fleck;
  const mesh = new InstancedMesh(geometry, toonMaterial({ highlight: 0.4 }), SPRINKLES.count);
  const path = new Swirl();
  const euler = new Euler();
  const matrix = new Matrix4();
  const point = new Vector3();
  for (let i = 0; i < SPRINKLES.count; i++) {
    const t = between(random, 0.05, 0.92);
    path.getPointAt(t, point);
    const out = new Vector3(point.x, 0, point.z).normalize();
    const rope = ropeAt(t);
    const lift = between(random, 0.3, 1); // from the rope's outer side round to its top
    const position = point
      .clone()
      .addScaledVector(out, rope * (1 - lift) * 0.95)
      .add(new Vector3(0, rope * SWIRL.squash * lift * 0.95, 0));
    const tilt = new Quaternion().setFromEuler(euler.set(between(random, -0.6, 0.6), random() * 6.28, 0));
    const size = between(random, ...SPRINKLES.size) * (style === "bloom" ? 1 : 0.55);
    mesh.setMatrixAt(i, matrix.compose(position, tilt, new Vector3(size, size, size)));
    mesh.setColorAt(i, new Color(pick(random, colours)));
  }
  return mesh;
}
