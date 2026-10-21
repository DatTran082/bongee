import {
  type BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  Shape,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { between, type Random } from "../random";

// The shapes of the stage's props, as a stylized drink game asset models them: round and smooth, soft-edged, a little
// plump; the toon material paints them in soft bands. Each comes indexed with smooth normals (the outline hulls push
// out along them), about 1 across, its middle at the origin unless noted.

/** Detail of the round shapes (icosphere subdivisions): smooth at any size the stage draws them. */
const ROUND = 4;
const SMALL = 3;

/** Positions (and colours) only, not indexed: parts in this form merge whatever they were made as. */
function bare(geometry: BufferGeometry): BufferGeometry {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (flat !== geometry) geometry.dispose();
  flat.deleteAttribute("normal");
  flat.deleteAttribute("uv");
  return flat;
}

/** Indexed, welded, with smooth normals: what the toon material and the outline both want. */
function finish(geometry: BufferGeometry): BufferGeometry {
  const welded = mergeVertices(bare(geometry), 1e-4);
  welded.computeVertexNormals();
  welded.computeBoundingSphere();
  return welded;
}

/** Merges parts of any kind into one shape (each keeps its own surface; overlaps are hidden inside). */
function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts.map(bare));
  if (!merged) throw new Error("Shape parts do not merge.");
  return merged;
}

/** A smooth sphere of `radius`, welded (so it can be bent without tearing). */
function ball(radius: number, detail = ROUND): BufferGeometry {
  return mergeVertices(bare(new IcosahedronGeometry(radius, detail)), 1e-5);
}

/** Moves every vertex by `f(p)` (in place). */
function bend(geometry: BufferGeometry, f: (p: Vector3) => void): BufferGeometry {
  const position = geometry.getAttribute("position");
  const p = new Vector3();
  for (let i = 0; i < position.count; i++) {
    f(p.fromBufferAttribute(position, i));
    position.setXYZ(i, p.x, p.y, p.z);
  }
  return geometry;
}

/** A smooth lumpy field: a few low sine waves with random phases, about ±1. */
function lumps(random: Random, count: number): (p: Vector3) => number {
  const waves = Array.from({ length: count }, () => ({
    k: new Vector3(between(random, -1, 1), between(random, -1, 1), between(random, -1, 1))
      .normalize()
      .multiplyScalar(between(random, 2, 4.5)),
    phase: random() * Math.PI * 2,
  }));
  return (p) => waves.reduce((sum, w) => sum + Math.sin(w.k.dot(p) + w.phase), 0) / Math.sqrt(count);
}

const linear = (hex: string): number[] =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; // vertex colours are linear
  });

/** Colours each vertex by `pick(position)` (for shapes of several colours: toon `vertexColors`). */
function colourBy(geometry: BufferGeometry, pick: (p: Vector3) => number[]): BufferGeometry {
  const position = geometry.getAttribute("position");
  const data = new Float32Array(position.count * 3);
  const p = new Vector3();
  for (let i = 0; i < position.count; i++) data.set(pick(p.fromBufferAttribute(position, i)), i * 3);
  geometry.setAttribute("color", new Float32BufferAttribute(data, 3));
  return geometry;
}

const paint = (geometry: BufferGeometry, hex: string) => colourBy(bare(geometry), () => linear(hex));

/** One grape, a little longer than wide. */
export function grape(): BufferGeometry {
  return finish(ball(0.5).scale(0.9, 1, 0.9));
}

/** A small bunch: three grapes touching. */
export function grapeBunch(): BufferGeometry {
  const at = [
    [0, 0.18, 0],
    [-0.22, -0.12, 0.05],
    [0.22, -0.1, -0.04],
  ];
  return finish(merge(at.map(([x, y, z]) => ball(0.28, SMALL).scale(0.92, 1, 0.92).translate(x, y, z))));
}

/** A mango: a plump, slightly bent egg. */
export function mango(): BufferGeometry {
  return finish(
    bend(ball(0.5).scale(0.74, 1, 0.62), (p) => {
      p.x += 0.13 * p.y * p.y; // the bend
      p.z *= 1 - 0.18 * Math.max(0, p.y); // narrower toward the stem
    }),
  );
}

/** An ice cube with rounded edges. */
export function ice(): BufferGeometry {
  return finish(new RoundedBoxGeometry(0.9, 0.82, 0.88, 4, 0.16));
}

/** A coffee bean: a plump oval with its crease down the flat side. */
export function bean(): BufferGeometry {
  return finish(
    bend(ball(0.5, SMALL).scale(1, 0.58, 0.72), (p) => {
      if (p.y > 0) p.y -= 0.14 * Math.exp(-((p.z / 0.07) ** 2)) * (p.y / 0.29); // the crease
    }),
  );
}

/** A wedge of cheese with soft edges. */
export function cheeseWedge(): BufferGeometry {
  const shape = new Shape([new Vector2(0, 0), new Vector2(0.95, 0.1), new Vector2(0.06, 0.6)]);
  const g = new ExtrudeGeometry(shape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 1,
  });
  g.center();
  return finish(g);
}

/** A blackberry: round drupelets on a core. */
export function berry(random: Random): BufferGeometry {
  const parts = [ball(0.34, SMALL)];
  for (let i = 0; i < 22; i++) {
    const dir = new Vector3(between(random, -1, 1), between(random, -0.9, 1.1), between(random, -1, 1)).normalize();
    parts.push(ball(0.15, 2).translate(dir.x * 0.34, dir.y * 0.38, dir.z * 0.34));
  }
  return finish(merge(parts));
}

/** A five-petalled flower (the logo's, in the round): soft petals about a round heart, coloured per vertex. */
export function flower(petalHex: string, heartHex: string): BufferGeometry {
  const petal = new Shape();
  petal.moveTo(0, 0);
  petal.quadraticCurveTo(0.22, 0.18, 0.08, 0.48);
  petal.quadraticCurveTo(0, 0.56, -0.08, 0.48);
  petal.quadraticCurveTo(-0.22, 0.18, 0, 0);
  const petals = Array.from({ length: 5 }, (_, i) =>
    paint(
      new ExtrudeGeometry(petal, {
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.015,
        bevelSegments: 3,
        curveSegments: 12,
      })
        .rotateX(-Math.PI / 2 + 0.35) // lying open, tips raised: a cup of petals
        .rotateY((i * 2 * Math.PI) / 5),
      petalHex,
    ),
  );
  const heart = paint(ball(0.1, SMALL).scale(1, 0.7, 1).translate(0, 0.06, 0), heartHex);
  return finish(merge([...petals, heart]));
}

/** A puff of foam. */
export function puff(): BufferGeometry {
  return finish(ball(0.5, SMALL).scale(1, 0.85, 1));
}

/** A dried rose petal: a curled, soft flake. */
export function petalFlake(): BufferGeometry {
  const shape = new Shape();
  shape.moveTo(0, -0.5);
  shape.quadraticCurveTo(0.5, -0.1, 0.1, 0.5);
  shape.quadraticCurveTo(-0.4, 0.2, 0, -0.5);
  const g = new ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 10,
  });
  bend(g, (p) => {
    p.z += 0.3 * p.x * p.x; // the curl
  });
  g.center();
  return finish(g);
}

/**
 * A boulder `width` × `height` × `depth`: a rounded, gently lumpy stone whose top is flattened at y = 0 (for cups to
 * stand on) with a soft rounded edge, not a cut.
 */
export function boulder(random: Random, width: number, height: number, depth: number): BufferGeometry {
  const lumpy = lumps(random, 5);
  const top = 0.3;
  const shoulder = 0.08;
  const g = bend(ball(0.5), (p) => {
    p.multiplyScalar(1 + 0.11 * lumpy(p));
    if (p.y > top - shoulder) p.y = top - shoulder * Math.exp(-(p.y - (top - shoulder)) / shoulder); // rounds over flat
    p.set(p.x * width, ((p.y - top) / (0.5 + top)) * height, p.z * depth);
  });
  return finish(g);
}

export interface LogColours {
  readonly bark: string;
  readonly barkDark: string;
  readonly cut: string;
  readonly ring: string;
}

/**
 * A sawn log of `radius`, from y = 0 up to `height`: a round trunk, a little irregular, its top edge rounded, flaring
 * at the foot; bark in upright streaks round it, the cut on top in pale rings.
 */
export function log(random: Random, radius: number, height: number, colours: LogColours): BufferGeometry {
  const round = radius * 0.12;
  const profile = [new Vector2(0, height)];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2); // the rounded top edge
    profile.push(new Vector2(radius - round + round * Math.sin(a), height - round + round * Math.cos(a)));
  }
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    profile.push(new Vector2(radius * (1 + 0.06 * t * t), (height - round) * (1 - t)));
  }
  profile.push(new Vector2(0, 0));
  const lumpy = lumps(random, 4);
  // a lathe faces outward when its profile runs from the foot up: built top-down above, so reversed here
  const g = mergeVertices(bare(new LatheGeometry(profile.reverse(), 40)), 1e-6);
  bend(g, (p) => {
    const k = 1 + 0.04 * lumpy(new Vector3(p.x / radius, p.y / height, p.z / radius));
    p.x *= k;
    p.z *= k;
  });
  const bark = [linear(colours.bark), linear(colours.barkDark)];
  const cut = [linear(colours.cut), linear(colours.ring)];
  colourBy(g, (p) => {
    const r = Math.hypot(p.x, p.z) / radius;
    if (p.y > height - round * 0.5 && r < 0.92) {
      const ring = 0.5 + 0.5 * Math.cos(r * Math.PI * 7); // pale rings
      return cut[0].map((c, i) => c + (cut[1][i] - c) * ring * 0.8);
    }
    const streak = 0.5 + 0.5 * Math.sin(Math.atan2(p.z, p.x) * 11 + 2 * Math.sin(p.y * 30));
    return bark[0].map((c, i) => c + (bark[1][i] - c) * streak * streak);
  });
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** A cloud: a few round puffs on a flat underside, about 1 wide. */
export function cloud(): BufferGeometry {
  const puffs = [
    [-0.28, 0, 0, 0.26],
    [0, 0.08, 0, 0.34],
    [0.3, 0.02, 0, 0.24],
    [0.1, 0.02, 0.12, 0.22],
  ].map(([x, y, z, r]) =>
    bend(ball(r, SMALL).translate(x, y, z), (p) => {
      p.y = Math.max(p.y, -0.1); // a flat underside
    }),
  );
  return finish(merge(puffs));
}
