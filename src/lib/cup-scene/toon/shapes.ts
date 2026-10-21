import {
  type BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Shape,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { between, type Random } from "../random";

// The low-poly shapes of the stage's props, as a stylized drink game asset draws them: a few dozen faces each, a
// little irregular, flat-shaded by the toon material. Each comes indexed with smooth normals (the outline hull pushes
// out along them; the faces still render flat), about 1 across, its middle at the origin unless noted.

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

/** Merges parts of any kind into one shape. */
function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts.map(bare));
  if (!merged) throw new Error("Low-poly parts do not merge.");
  return merged;
}

/** Moves each vertex by up to `amount` along a random direction (welded first, so faces stay closed). */
function jitter(geometry: BufferGeometry, random: Random, amount: number): BufferGeometry {
  const welded = mergeVertices(bare(geometry), 1e-4);
  const position = welded.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    position.setXYZ(
      i,
      position.getX(i) + between(random, -amount, amount),
      position.getY(i) + between(random, -amount, amount),
      position.getZ(i) + between(random, -amount, amount),
    );
  }
  return welded;
}

const linear = (hex: string): number[] =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; // vertex colours are linear
  });

/**
 * Paints a part (for shapes of several colours: toon `vertexColors`): one colour, or with `vary` each face a little
 * lighter or darker at random, as bark is.
 */
function paint(geometry: BufferGeometry, hex: string, vary?: { random: Random; amount: number }): BufferGeometry {
  const part = bare(geometry);
  const base = linear(hex);
  const count = part.getAttribute("position").count;
  const data = new Float32Array(count * 3);
  for (let face = 0; face < count / 3; face++) {
    const k = vary ? 1 + between(vary.random, -vary.amount, vary.amount) : 1;
    for (let v = 0; v < 3; v++)
      data.set(
        base.map((c) => c * k),
        (face * 3 + v) * 3,
      );
  }
  part.setAttribute("color", new Float32BufferAttribute(data, 3));
  return part;
}

/** One grape, a little longer than wide. */
export function grape(): BufferGeometry {
  return finish(new IcosahedronGeometry(0.5, 1).scale(0.9, 1, 0.9));
}

/** A small bunch: three grapes touching. */
export function grapeBunch(): BufferGeometry {
  const at = [
    [0, 0.18, 0],
    [-0.22, -0.12, 0.05],
    [0.22, -0.1, -0.04],
  ];
  return finish(merge(at.map(([x, y, z]) => new IcosahedronGeometry(0.27, 1).scale(0.9, 1, 0.9).translate(x, y, z))));
}

/** A mango: a flattened, slightly bent egg. */
export function mango(random: Random): BufferGeometry {
  const g = jitter(new IcosahedronGeometry(0.5, 1).scale(0.74, 1, 0.6), random, 0.02);
  const position = g.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    position.setX(i, position.getX(i) + 0.14 * y * y); // the bend
  }
  return finish(g);
}

/** An ice cube with softened, uneven faces. */
export function ice(random: Random): BufferGeometry {
  return finish(jitter(new IcosahedronGeometry(0.62, 0).scale(0.95, 0.85, 0.95), random, 0.04));
}

/** A coffee bean: a flat oval. */
export function bean(random: Random): BufferGeometry {
  return finish(jitter(new IcosahedronGeometry(0.5, 1).scale(1, 0.56, 0.72), random, 0.015));
}

/** A wedge of cheese. */
export function cheeseWedge(): BufferGeometry {
  const shape = new Shape([new Vector2(0, 0), new Vector2(1, 0.12), new Vector2(0.05, 0.62)]);
  const g = new ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: false, curveSegments: 1 });
  g.center();
  return finish(g);
}

/** A blackberry: drupelets round a core. */
export function berry(random: Random): BufferGeometry {
  const parts = [new IcosahedronGeometry(0.34, 1)];
  for (let i = 0; i < 14; i++) {
    const dir = new Vector3(between(random, -1, 1), between(random, -0.9, 1.1), between(random, -1, 1)).normalize();
    parts.push(new IcosahedronGeometry(0.17, 0).translate(dir.x * 0.34, dir.y * 0.38, dir.z * 0.34));
  }
  return finish(merge(parts));
}

/** A five-petalled flower (the logo's, in the round): petals about a heart, coloured per vertex. */
export function flower(petalHex: string, heartHex: string): BufferGeometry {
  const petal = new Shape();
  petal.moveTo(0, 0);
  petal.quadraticCurveTo(0.2, 0.18, 0.08, 0.5);
  petal.quadraticCurveTo(0, 0.56, -0.08, 0.5);
  petal.quadraticCurveTo(-0.2, 0.18, 0, 0);
  const petals = Array.from({ length: 5 }, (_, i) =>
    paint(
      new ExtrudeGeometry(petal, { depth: 0.05, bevelEnabled: false, curveSegments: 2 })
        .rotateX(-Math.PI / 2 + 0.35) // lying open, tips raised: a cup of petals
        .rotateY((i * 2 * Math.PI) / 5),
      petalHex,
    ),
  );
  const heart = paint(new IcosahedronGeometry(0.1, 0).translate(0, 0.06, 0), heartHex);
  return finish(merge([...petals, heart]));
}

/** A puff of foam. */
export function puff(random: Random): BufferGeometry {
  return finish(jitter(new IcosahedronGeometry(0.5, 1), random, 0.035));
}

/** A dried rose petal: a curled flake. */
export function petalFlake(): BufferGeometry {
  const shape = new Shape();
  shape.moveTo(0, -0.5);
  shape.quadraticCurveTo(0.5, -0.1, 0.1, 0.5);
  shape.quadraticCurveTo(-0.4, 0.2, 0, -0.5);
  const g = new ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false, curveSegments: 2 });
  const position = g.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    position.setZ(i, position.getZ(i) + 0.3 * x * x); // the curl
  }
  g.center();
  return finish(g);
}

/** A boulder `width` × `height` × `depth`, its top flat at y = 0 (for cups to stand on), irregular all round. */
export function boulder(random: Random, width: number, height: number, depth: number): BufferGeometry {
  const g = jitter(new IcosahedronGeometry(0.5, 1), random, 0.05);
  const top = 0.3;
  const position = g.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const y = Math.min(position.getY(i), top);
    position.setXYZ(i, position.getX(i) * width, ((y - top) / (0.5 + top)) * height, position.getZ(i) * depth);
  }
  return finish(g);
}

export interface LogColours {
  readonly bark: string;
  readonly cut: string;
  readonly ring: string;
}

/** A sawn log of `radius`, from y = 0 up to `height`: bark round it, a pale cut on top with one darker ring. */
export function log(random: Random, radius: number, height: number, colours: LogColours): BufferGeometry {
  const body = jitter(new CylinderGeometry(radius, radius * 1.06, height, 9, 2, true), random, radius * 0.05);
  const cut = new CylinderGeometry(radius * 0.98, radius * 0.98, radius * 0.06, 9, 1).translate(0, height / 2, 0);
  const ring = new CylinderGeometry(radius * 0.55, radius * 0.55, radius * 0.08, 9, 1).translate(0, height / 2, 0);
  const bark = paint(body, colours.bark, { random, amount: 0.22 });
  const g = merge([bark, paint(cut, colours.cut), paint(ring, colours.ring)]);
  g.translate(0, height / 2, 0);
  g.computeVertexNormals(); // not welded: each face keeps its own colour
  // the outline needs a closed, smooth-normalled skin: a welded copy without the colours (toon/outline.ts)
  const skin = g.clone();
  skin.deleteAttribute("color");
  g.userData.hull = finish(skin);
  return g;
}

/** A cloud: a few low-poly puffs on a flat underside, about 1 wide. */
export function cloud(random: Random): BufferGeometry {
  const puffs = [
    [-0.28, 0, 0, 0.26],
    [0, 0.08, 0, 0.34],
    [0.3, 0.02, 0, 0.24],
    [0.1, 0.02, 0.12, 0.22],
  ].map(([x, y, z, r]) => jitter(new IcosahedronGeometry(r, 1), random, r * 0.08).translate(x, y, z));
  const g = merge(puffs);
  const position = g.getAttribute("position");
  for (let i = 0; i < position.count; i++) position.setY(i, Math.max(position.getY(i), -0.1));
  return finish(g);
}
