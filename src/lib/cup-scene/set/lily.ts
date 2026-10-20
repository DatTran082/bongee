import {
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { LILY } from "./palette";
import { between, type Random, seeded } from "../random";

// The white lily with a yellow throat lying on the tall log in the cover photo: six tepals opening from the base and
// recurving at the tips, six stamens with orange anthers, one pistil. Local +y is the flower's axis, the base at the
// origin; sizes in metres.

const TEPAL = { length: 0.032, halfWidth: 0.0068, open: 0.55, recurve: 1.9, cup: 0.5 } as const;
const STEPS = { along: 20, across: 8 } as const;
const UP = new Vector3(0, 1, 0);

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * One tepal as a ribbon along a centreline that leaves the axis at `open` and bends out to `recurve` (radians from
 * the axis) at the tip; its edges curl towards the flower's inside and ruffle a little. Vertex colours run from the
 * yellow throat to white.
 */
function tepal(random: Random, azimuth: number, width: number): BufferGeometry {
  const radial = new Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
  const across = new Vector3(-Math.sin(azimuth), 0, Math.cos(azimuth));
  const open = TEPAL.open + between(random, -0.08, 0.08);
  const recurve = TEPAL.recurve + between(random, -0.15, 0.15);
  const phase = random() * Math.PI * 2;
  const throat = new Color(LILY.throat);
  const white = new Color(LILY.tepal);
  const positions: number[] = [];
  const colours: number[] = [];
  const point = radial.clone().multiplyScalar(0.0012);
  for (let j = 0; j <= STEPS.along; j++) {
    const t = j / STEPS.along;
    const angle = open + (recurve - open) * Math.pow(t, 1.7);
    const direction = radial.clone().multiplyScalar(Math.sin(angle)).addScaledVector(UP, Math.cos(angle));
    if (j > 0) point.addScaledVector(direction, TEPAL.length / STEPS.along);
    const inside = new Vector3().crossVectors(across, direction);
    const w = width * (0.15 + 0.85 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.7)) * (1 - 0.2 * t);
    const colour = throat.clone().lerp(white, smooth(0.05, 0.45, t));
    for (let k = 0; k <= STEPS.across; k++) {
      const s = -1 + (2 * k) / STEPS.across;
      const ruffle = 0.0005 * Math.sin(t * 14 + s * 3 + phase) * s * s * t;
      const p = point
        .clone()
        .addScaledVector(across, s * w)
        .addScaledVector(inside, TEPAL.cup * w * s * s + ruffle);
      positions.push(p.x, p.y, p.z);
      colours.push(colour.r, colour.g, colour.b);
    }
  }
  const index: number[] = [];
  const row = STEPS.across + 1;
  for (let j = 0; j < STEPS.along; j++) {
    for (let k = 0; k < STEPS.across; k++) {
      const a = j * row + k;
      index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colours, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** A filament from the centre, curving up and out, tipped with a crosswise anther (or the pistil's stigma). */
function stamen(azimuth: number, reach: number, rise: number, tip: Mesh, material: MeshStandardMaterial): Group {
  const radial = new Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
  const end = radial.clone().multiplyScalar(reach).addScaledVector(UP, rise);
  const curve = new CatmullRomCurve3([
    new Vector3(0, 0.002, 0),
    radial
      .clone()
      .multiplyScalar(reach * 0.3)
      .addScaledVector(UP, rise * 0.55),
    end,
  ]);
  const group = new Group();
  group.add(new Mesh(new TubeGeometry(curve, 12, 0.00032, 5), material));
  tip.position.copy(end);
  tip.quaternion.setFromUnitVectors(UP, new Vector3(-Math.sin(azimuth), 0, Math.cos(azimuth)));
  group.add(tip);
  return group;
}

export function createLily(): Group {
  const random = seeded(47);
  const lily = new Group();
  lily.name = "lily";
  const petal = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.5,
    sheen: 0.6,
    sheenRoughness: 0.5,
    sheenColor: new Color("#ffffff"),
    side: DoubleSide,
  });
  for (let i = 0; i < 6; i++) {
    // outer whorl (sepals) a touch narrower than the inner (petals)
    const width = TEPAL.halfWidth * (i % 2 ? 1.12 : 0.92);
    lily.add(new Mesh(tepal(random, (i / 6) * Math.PI * 2 + between(random, -0.06, 0.06), width), petal));
  }
  const filament = new MeshStandardMaterial({ color: LILY.filament, roughness: 0.6 });
  const anther = new MeshStandardMaterial({ color: LILY.anther, roughness: 0.95 });
  const anthers = new CapsuleGeometry(0.0007, 0.0042, 4, 8);
  for (let i = 0; i < 6; i++) {
    const azimuth = ((i + 0.5) / 6) * Math.PI * 2;
    lily.add(
      stamen(
        azimuth,
        between(random, 0.011, 0.014),
        between(random, 0.022, 0.026),
        new Mesh(anthers, anther),
        filament,
      ),
    );
  }
  const stigma = new Mesh(new SphereGeometry(0.0013, 10, 8), new MeshStandardMaterial({ color: LILY.stigma }));
  lily.add(stamen(0.4, 0.004, 0.03, stigma, filament));
  lily.traverse((object) => {
    if (object instanceof Mesh) object.castShadow = object.receiveShadow = true;
  });
  return lily;
}
