import { BufferAttribute, type BufferGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { FOOT, type LogSpec, STONE_TOP } from "./layout";
import { between, seeded, wobble } from "./random";
import { graniteTexture, woodSideTexture, woodTopTexture } from "./textures";

/** Texture repeats per metre on the stone (one 512 px tile ≈ 25 cm, so its grains read as 1–2 mm). */
const GRANITE_TILE = 4;

/** Box-projected UVs for a flat-faced, non-indexed geometry: each face takes the plane it faces most. */
function boxUVs(geometry: BufferGeometry, perMetre: number): void {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const [nx, ny, nz] = [Math.abs(normal.getX(i)), Math.abs(normal.getY(i)), Math.abs(normal.getZ(i))];
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)];
    const [u, v] = ny >= nx && ny >= nz ? [x, z] : nx >= nz ? [z, y] : [x, y];
    uv[i * 2] = u * perMetre;
    uv[i * 2 + 1] = v * perMetre;
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
}

/**
 * The granite block: a flat top (the outline in layout.ts, so a cup stands level on it), broken edges just below it,
 * faceted sides bulging a little, running down out of the frame. Built as the convex hull of jittered rings of
 * points, so every face is a flat break.
 */
export function createStone(): Mesh {
  const random = seeded(7);
  const cx = STONE_TOP.reduce((sum, [x]) => sum + x, 0) / STONE_TOP.length;
  const cz = STONE_TOP.reduce((sum, [, z]) => sum + z, 0) / STONE_TOP.length;
  const points: Vector3[] = [];
  const ring = (x: number, z: number, y: number, out: number) => {
    const length = Math.hypot(x - cx, z - cz);
    const jitter = () => between(random, -0.004, 0.004);
    points.push(new Vector3(x + ((x - cx) / length) * out + jitter(), y, z + ((z - cz) / length) * out + jitter()));
  };
  STONE_TOP.forEach(([x, z], i) => {
    points.push(new Vector3(x, 0, z));
    ring(x, z, -between(random, 0.01, 0.035), between(random, 0.005, 0.014)); // the broken top edge
    ring(x, z, -between(random, 0.1, 0.22), between(random, 0.008, 0.02)); // the bulge of the side
    ring(x, z, FOOT, between(random, 0.004, 0.016));
    const [nx, nz] = STONE_TOP[(i + 1) % STONE_TOP.length];
    ring((x + nx) / 2, (z + nz) / 2, -between(random, 0.002, 0.008), between(random, 0, 0.006)); // a nick
  });
  const geometry = new ConvexGeometry(points);
  boxUVs(geometry, GRANITE_TILE);
  const granite = graniteTexture(random);
  const material = new MeshStandardMaterial({
    map: granite,
    bumpMap: granite,
    bumpScale: 1.5,
    roughness: 0.86,
    flatShading: true,
  });
  const stone = new Mesh(geometry, material);
  stone.name = "stone";
  stone.castShadow = stone.receiveShadow = true;
  return stone;
}

/**
 * A barked-off log standing on end, its top sawn flat: a cylinder made a little lumpy round its girth and along its
 * length. The normals stay those of the plain cylinder (the lumps are a few percent), which keeps its seam invisible.
 */
export function createLog(spec: LogSpec): Mesh {
  const random = seeded(spec.seed);
  const height = spec.top - FOOT;
  const geometry = new CylinderGeometry(spec.radius, spec.radius * 1.05, height, 72, 24);
  const around = wobble(random, 5, 0.045);
  const along = wobble(random, 3, 0.02);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)];
    if (Math.hypot(x, z) < 1e-9) continue; // the centre of a cap
    const scale = 1 + around(Math.atan2(z, x)) + along(y * 30);
    position.setXYZ(i, x * scale, y, z * scale);
  }
  geometry.translate(0, FOOT + height / 2, 0);
  const side = woodSideTexture(random);
  const top = new MeshStandardMaterial({ map: woodTopTexture(random), roughness: 0.82 });
  const material = new MeshStandardMaterial({ map: side, bumpMap: side, bumpScale: 3, roughness: 0.9 });
  const log = new Mesh(geometry, [material, top, top]); // CylinderGeometry groups: side, top, bottom
  log.position.set(spec.x, 0, spec.z);
  log.rotation.y = random() * Math.PI * 2;
  log.castShadow = log.receiveShadow = true;
  return log;
}
