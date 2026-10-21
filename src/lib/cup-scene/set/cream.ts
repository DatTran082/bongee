import {
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  SplineCurve,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { between, pick, type Random, seeded, wobble } from "../random";
import { CREAM, SPRINKLES } from "./palette";

// The cream-cheese foam dome on the open cup (brandkit/lookbook/prompts-anh-bia.md, "Chóp kem bông"): warm ivory,
// thick, pocked all over with air bubbles like a milk foam, a round dome about 2.5 cm over the rim whose soft edge
// spills a little past the white rolled rim; on top, dried rose petals (curled flakes, rose to crimson) and glossy
// flecks of dried osmanthus. In cup coordinates (the GLB's: base at the origin, the rolled rim round y = 0.1337 m,
// outer radius 0.0466 m).

/**
 * The dome's profile (radius, height), from its flat underside to the top on the axis. Nothing of it goes down into
 * the cup: the paper wall above the outer sleeve (129–132 mm) is a thin shell, and foam below the rim showed through
 * it. The underside sits just over the inner shoulder of the rolled rim (a torus 132.3–135 mm, outer r 46.6) and the
 * dome only spreads out once it is above the rim's top, so its overhang rests on the rim and hides the cup's mouth.
 */
const PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, 0.1348],
  [0.044, 0.1348],
  [0.0446, 0.1354],
  [0.0458, 0.1358],
  [0.0478, 0.1366],
  [0.0492, 0.1385],
  [0.0496, 0.141],
  [0.0484, 0.1442],
  [0.0454, 0.1482],
  [0.0405, 0.1522],
  [0.0335, 0.1557],
  [0.0247, 0.1584],
  [0.0155, 0.16],
  [0.0062, 0.1608],
  [0, 0.161],
];
/** Above this the dome is free to swell and ripple; below it stays a clean revolve inside the cup. */
const RIM_Y = 0.1358;
/** The foam's surface: one texture tile covers `tile` metres, seen from above (planar UVs). */
const FOAM = { tile: 0.034, px: 512, pits: 2200, bigPits: 70 };
const FLAKES = { petals: 48, crumbs: 36, osmanthus: 110, spread: 0.044 };

/** The foam, drawn once: its colour (pits darker, their far rims lighter) and the same pits as a bump map. */
function foamMaps(random: Random): { map: CanvasTexture; bump: CanvasTexture } {
  const size = FOAM.px;
  const make = () => {
    const element = document.createElement("canvas");
    element.width = element.height = size;
    const ctx = element.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available.");
    return [element, ctx] as const;
  };
  const [colour, c] = make();
  const [bump, b] = make();
  c.fillStyle = CREAM.ground;
  c.fillRect(0, 0, size, size);
  b.fillStyle = "#8a8a8a";
  b.fillRect(0, 0, size, size);
  // faint mottling under everything
  for (let i = 0; i < 40; i++) {
    c.globalAlpha = between(random, 0.05, 0.12);
    c.fillStyle = pick(random, CREAM.mottle);
    const r = between(random, 30, 90);
    c.beginPath();
    c.ellipse(random() * size, random() * size, r, r * between(random, 0.6, 1), random() * Math.PI, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
  const pit = (x: number, y: number, r: number) => {
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const px = x + dx;
        const py = y + dy;
        if (px < -r || px > size + r || py < -r || py > size + r) continue;
        // colour: a darker hollow with a lighter far rim, as a lit bubble reads
        const g = c.createRadialGradient(px + r * 0.15, py + r * 0.15, 0, px, py, r);
        g.addColorStop(0, CREAM.pitDeep);
        g.addColorStop(0.55, CREAM.pit);
        g.addColorStop(0.85, CREAM.pitRim);
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(px, py, r, 0, Math.PI * 2);
        c.fill();
        // bump: the hollow
        const h = b.createRadialGradient(px, py, 0, px, py, r);
        h.addColorStop(0, "rgba(40,40,40,0.95)");
        h.addColorStop(0.7, "rgba(90,90,90,0.6)");
        h.addColorStop(1, "rgba(150,150,150,0)");
        b.fillStyle = h;
        b.beginPath();
        b.arc(px, py, r, 0, Math.PI * 2);
        b.fill();
      }
    }
  };
  const pxPerM = size / FOAM.tile;
  for (let i = 0; i < FOAM.pits; i++) pit(random() * size, random() * size, between(random, 0.00035, 0.0011) * pxPerM);
  for (let i = 0; i < FOAM.bigPits; i++)
    pit(random() * size, random() * size, between(random, 0.0012, 0.0024) * pxPerM);
  const texture = (element: HTMLCanvasElement, srgb: boolean) => {
    const t = new CanvasTexture(element);
    if (srgb) t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 4;
    return t;
  };
  return { map: texture(colour, true), bump: texture(bump, false) };
}

function dome(random: Random): Mesh {
  const curve = new SplineCurve(PROFILE.map(([r, y]) => new Vector2(r, y)));
  const lathe = new LatheGeometry(curve.getPoints(72), 144);
  lathe.deleteAttribute("uv");
  lathe.deleteAttribute("normal");
  // weld the lathe's seam, so the normals computed below run smoothly across it
  const geometry = mergeVertices(lathe, 1e-6);
  const swell = wobble(random, 4, 0.0014);
  const ripple = wobble(random, 7, 0.0006);
  const lumps = wobble(random, 9, 0.0004);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)];
    const r = Math.hypot(x, z);
    if (y < RIM_Y || r < 1e-9) continue;
    const a = Math.atan2(z, x);
    const rise = Math.min(1, (y - RIM_Y) / 0.004); // keeps the dome seated on the rim
    const scale = 1 + (rise * (swell(a) + ripple(a + y * 300))) / r;
    const lift = rise * (ripple(a * 2) * 0.6 + lumps(a * 3 + r * 400));
    position.setXYZ(i, x * scale, y + lift, z * scale);
  }
  geometry.computeVertexNormals();
  // UVs, face by face on an unindexed copy (the smooth normals come along): planar from above where a face looks
  // up (the bubbles sit evenly over the top), round the dome where it slopes (a planar map would streak down the
  // shoulder). Round the dome the three corners of a face are kept within half a turn of each other, so no face
  // straddles the seam and smears the whole tile across itself; the planar / round join is a ring the pits hide.
  const unindexed = geometry.toNonIndexed();
  geometry.dispose();
  const flatPosition = unindexed.getAttribute("position");
  const flatNormal = unindexed.getAttribute("normal");
  const uv = new Float32Array(flatPosition.count * 2);
  const shoulder = PROFILE[6][0]; // the radius the shoulder's bubbles are sized by
  for (let f = 0; f < flatPosition.count; f += 3) {
    const up = (flatNormal.getY(f) + flatNormal.getY(f + 1) + flatNormal.getY(f + 2)) / 3 >= 0.72;
    const first = Math.atan2(flatPosition.getZ(f), flatPosition.getX(f));
    for (let i = f; i < f + 3; i++) {
      const [x, y, z] = [flatPosition.getX(i), flatPosition.getY(i), flatPosition.getZ(i)];
      if (up) {
        uv[i * 2] = x / FOAM.tile;
        uv[i * 2 + 1] = z / FOAM.tile;
      } else {
        let a = Math.atan2(z, x);
        while (a - first > Math.PI) a -= 2 * Math.PI;
        while (a - first < -Math.PI) a += 2 * Math.PI;
        uv[i * 2] = (a * shoulder) / FOAM.tile;
        uv[i * 2 + 1] = (y - RIM_Y) / FOAM.tile + 0.37; // offset: not the same patch as the top's centre
      }
    }
  }
  unindexed.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  const maps = foamMaps(random);
  const material = new MeshPhysicalMaterial({
    map: maps.map,
    bumpMap: maps.bump,
    bumpScale: 0.0022,
    roughness: 0.74,
    sheen: 0.4,
    sheenRoughness: 0.8,
    sheenColor: new Color("#fff6e4"),
  });
  const mesh = new Mesh(unindexed, material);
  mesh.name = "cream";
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** A dried petal: a teardrop of unit length, curled across and along, so it catches light like a dry flake. */
function petalGeometry(random: Random): ShapeGeometry {
  const shape = new Shape();
  const w = between(random, 0.5, 0.75);
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(w * 0.7, -0.3, w * 0.55, 0.35, 0, 0.5);
  shape.bezierCurveTo(-w * 0.55, 0.35, -w * 0.7, -0.3, 0, -0.5);
  const geometry = new ShapeGeometry(shape, 10);
  const position = geometry.getAttribute("position");
  const curl = between(random, 0.35, 0.9);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, curl * (x * x * 1.6 + y * y * 0.5));
  }
  geometry.computeVertexNormals();
  return geometry;
}

interface Sprinkle {
  readonly mesh: InstancedMesh;
  readonly count: number;
  readonly size: readonly [number, number];
  readonly colours: readonly string[];
  /** how far from the centre they reach, as a power on the spread (lower: more in the middle) */
  readonly reach: number;
  /** tilt of the flake off the surface, radians */
  readonly tilt: number;
}

/** Drops each kind of sprinkle straight down onto the dome and lays it along the surface, tilted a little. */
function sprinkle(random: Random, cream: Mesh, kinds: readonly Sprinkle[]): InstancedMesh[] {
  cream.updateMatrixWorld();
  const raycaster = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const facing = new Vector3(0, 0, 1);
  const turn = new Quaternion();
  const matrix = new Matrix4();
  for (const kind of kinds) {
    let placed = 0;
    for (let i = 0; i < kind.count; i++) {
      const r = FLAKES.spread * Math.pow(random(), kind.reach);
      const a = random() * Math.PI * 2;
      raycaster.set(new Vector3(r * Math.cos(a), 0.2, r * Math.sin(a)), down);
      const hit = raycaster.intersectObject(cream)[0];
      if (!hit?.face) continue;
      const normal = hit.face.normal.clone();
      const orient = new Quaternion().setFromUnitVectors(facing, normal);
      orient.multiply(turn.setFromAxisAngle(facing, random() * Math.PI * 2));
      orient.multiply(turn.setFromAxisAngle(new Vector3(1, 0, 0), between(random, -kind.tilt, kind.tilt)));
      const size = between(random, kind.size[0], kind.size[1]);
      matrix.compose(hit.point.addScaledVector(normal, size * 0.12), orient, new Vector3(size, size, size));
      kind.mesh.setMatrixAt(placed, matrix);
      kind.mesh.setColorAt(placed, new Color(pick(random, kind.colours)));
      placed++;
    }
    kind.mesh.count = placed; // a flake that missed the dome is left out, not drawn at the origin at full size
    kind.mesh.castShadow = true;
  }
  return kinds.map((kind) => kind.mesh);
}

/** The dome with its sprinkles, in cup coordinates. */
export function createCream(): Group {
  const random = seeded(31);
  const group = new Group();
  group.name = "cream-dome";
  const cream = dome(random);
  const petal = new MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.6, side: DoubleSide });
  const gold = new MeshPhysicalMaterial({ roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 });
  const kinds: Sprinkle[] = [
    {
      mesh: new InstancedMesh(petalGeometry(random), petal, FLAKES.petals),
      count: FLAKES.petals,
      size: [0.0038, 0.0082],
      colours: SPRINKLES.petals,
      reach: 0.75,
      tilt: 0.7,
    },
    {
      mesh: new InstancedMesh(petalGeometry(random), petal, FLAKES.crumbs),
      count: FLAKES.crumbs,
      size: [0.0009, 0.002],
      colours: SPRINKLES.crumbs,
      reach: 0.6,
      tilt: 0.5,
    },
    {
      mesh: new InstancedMesh(new IcosahedronGeometry(0.5, 1), gold, FLAKES.osmanthus),
      count: FLAKES.osmanthus,
      size: [0.0009, 0.0022],
      colours: SPRINKLES.osmanthus,
      reach: 0.65,
      tilt: 0.4,
    },
  ];
  for (const kind of kinds) kind.mesh.name = "sprinkles";
  group.add(cream, ...sprinkle(random, cream, kinds));
  return group;
}
