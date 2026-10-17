import {
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  Raycaster,
  Shape,
  ShapeGeometry,
  SplineCurve,
  Vector2,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CREAM, SPRINKLES } from "./palette";
import { between, pick, type Random, seeded, wobble } from "./random";

// The cream-cheese foam dome on the open cup (brandkit/lookbook/prompts-anh-bia.md, "Chóp kem bông"): ivory, thick
// and smooth, a round dome about 2 cm over the rim whose edge spills just past the white rolled rim, sprinkled sparsely
// in the middle with dried rose petals and a few flecks of dried osmanthus. In cup coordinates (the GLB's: base at the
// origin, the rolled rim round y = 0.1337 m, outer radius 0.0466 m).

/** The dome's profile (radius, height), bottom inside the cup to the top on the axis. */
const PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, 0.126],
  [0.0438, 0.126],
  [0.0445, 0.1335],
  [0.0464, 0.1353],
  [0.0477, 0.1374],
  [0.0478, 0.1397],
  [0.0466, 0.1426],
  [0.0438, 0.1462],
  [0.0392, 0.15],
  [0.0325, 0.1533],
  [0.024, 0.1557],
  [0.015, 0.1571],
  [0.006, 0.1577],
  [0, 0.1578],
];
const RIM_Y = 0.1353;
const FLAKES = { petals: 120, osmanthus: 24, spread: 0.042 };

function dome(random: Random): Mesh {
  const curve = new SplineCurve(PROFILE.map(([r, y]) => new Vector2(r, y)));
  const lathe = new LatheGeometry(curve.getPoints(64), 120);
  lathe.deleteAttribute("uv");
  lathe.deleteAttribute("normal");
  // weld the lathe's seam, so the normals computed below run smoothly across it
  const geometry = mergeVertices(lathe, 1e-6);
  const swell = wobble(random, 4, 0.0011);
  const ripple = wobble(random, 6, 0.0005);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)];
    const r = Math.hypot(x, z);
    if (y < RIM_Y || r < 1e-9) continue;
    const a = Math.atan2(z, x);
    const rise = Math.min(1, (y - RIM_Y) / 0.004); // keeps the dome seated on the rim
    const scale = 1 + (rise * (swell(a) + ripple(a + y * 300))) / r;
    position.setXYZ(i, x * scale, y + rise * ripple(a * 2) * 0.6, z * scale);
  }
  geometry.computeVertexNormals();
  const material = new MeshPhysicalMaterial({
    color: CREAM,
    roughness: 0.72,
    sheen: 0.3,
    sheenRoughness: 0.7,
    sheenColor: new Color("#ffffff"),
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "cream";
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** A small flake: an irregular hexagon of unit radius (scaled per instance). */
function flake(random: Random): ShapeGeometry {
  const shape = new Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + between(random, -0.3, 0.3);
    const r = between(random, 0.55, 1);
    const [x, y] = [r * Math.cos(a), r * Math.sin(a) * 0.7];
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new ShapeGeometry(shape);
}

/** The sprinkles, dropped straight down onto the dome and laid along its surface, a little curled. */
function sprinkles(random: Random, cream: Mesh): InstancedMesh {
  const count = FLAKES.petals + FLAKES.osmanthus;
  const material = new MeshStandardMaterial({ roughness: 0.75, side: DoubleSide });
  const flakes = new InstancedMesh(flake(random), material, count);
  flakes.name = "sprinkles";
  flakes.castShadow = true;
  cream.updateMatrixWorld();
  const raycaster = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const facing = new Vector3(0, 0, 1);
  const tilt = new Quaternion();
  const matrix = new Matrix4();
  let placed = 0;
  for (let i = 0; i < count; i++) {
    const osmanthus = i >= FLAKES.petals;
    const r = FLAKES.spread * Math.pow(random(), osmanthus ? 0.6 : 0.8);
    const a = random() * Math.PI * 2;
    raycaster.set(new Vector3(r * Math.cos(a), 0.2, r * Math.sin(a)), down);
    const hit = raycaster.intersectObject(cream)[0];
    if (!hit?.face) continue;
    const normal = hit.face.normal.clone();
    const orient = new Quaternion().setFromUnitVectors(facing, normal);
    orient.multiply(tilt.setFromAxisAngle(facing, random() * Math.PI * 2));
    orient.multiply(tilt.setFromAxisAngle(new Vector3(1, 0, 0), between(random, -0.45, 0.45)));
    const size = osmanthus ? between(random, 0.0006, 0.001) : between(random, 0.0009, 0.0019);
    matrix.compose(hit.point.addScaledVector(normal, 0.0004), orient, new Vector3(size, size, size));
    flakes.setMatrixAt(placed, matrix);
    flakes.setColorAt(placed, new Color(pick(random, osmanthus ? SPRINKLES.osmanthus : SPRINKLES.petals)));
    placed++;
  }
  flakes.count = placed; // a flake that missed the dome is left out, not drawn at the origin at full size
  return flakes;
}

/** The dome with its sprinkles, in cup coordinates. */
export function createCream(): Group {
  const random = seeded(31);
  const group = new Group();
  group.name = "cream-dome";
  const cream = dome(random);
  group.add(cream, sprinkles(random, cream));
  return group;
}
