import { Color, Euler, Group, InstancedMesh, LatheGeometry, Matrix4, Mesh, Quaternion, Vector2, Vector3 } from "three";
import { between, pick, type Random, seeded } from "../random";
import { toonMaterial } from "./material";
import { addOutlines } from "./outline";
import { PROPS } from "./palette";
import { petalFlake, puff } from "./shapes";

// The foam on an open paper cup, as a stylized drink game asset draws whipped cream: two low-poly tiers with a soft
// tip, the lower one resting on the rolled rim (in the cup GLB's space: base at the origin, the rim round
// y = 0.1337 m, outer radius 0.0466 m), sprinkled on top: dried rose petals on the milk foam, mulberry flecks on the
// cheese foam. Its sides line up with the cup's twelve (toon/facet.ts).

/** Each tier's profile (radius, height), from its flat underside to the tip on the axis. */
const TIERS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 0.1348],
    [0.044, 0.1348],
    [0.0492, 0.1385],
    [0.0484, 0.1445],
    [0.041, 0.1515],
    [0.026, 0.1565],
    [0, 0.158],
  ],
  [
    [0, 0.1555],
    [0.029, 0.1555],
    [0.031, 0.1595],
    [0.024, 0.1655],
    [0.011, 0.1695],
    [0, 0.1705],
  ],
];
const SIDES = 12;
const SPRINKLES = { count: 26, size: [0.0055, 0.0085] as const, reach: 0.04 };

export type FoamStyle = "bloom" | "cheese";

/** The foam's top at `r` from the axis, the higher of the tiers there (for sprinkles to lie on it). */
function surface(r: number): number {
  let top = 0;
  for (const tier of TIERS) {
    for (let i = tier.length - 1; i > 0; i--) {
      const [r0, y0] = tier[i];
      const [r1, y1] = tier[i - 1];
      if (r >= r0 && r <= r1) top = Math.max(top, y0 + ((y1 - y0) * (r - r0)) / (r1 - r0 || 1));
    }
  }
  return top;
}

export function createFoam(style: FoamStyle = "bloom", seed = 5): Group {
  const random: Random = seeded(seed);
  const group = new Group();
  group.name = "foam";
  const colour = style === "bloom" ? PROPS.foam : PROPS.cheeseFoam;
  const material = toonMaterial({ color: colour, highlight: 0.7 });
  TIERS.forEach((profile, i) => {
    const lathe = new LatheGeometry(
      profile.map(([r, y]) => new Vector2(r, y)),
      SIDES,
      (i * Math.PI) / SIDES, // the upper tier turned half a side: the facets stagger
    );
    lathe.deleteAttribute("uv");
    group.add(new Mesh(lathe, material));
  });
  group.add(sprinkles(random, style));
  addOutlines(group, (mesh) => mesh instanceof InstancedMesh); // the sprinkles are too small for an outline
  group.traverse((object) => {
    if (object instanceof Mesh) object.castShadow = object.receiveShadow = true;
  });
  return group;
}

function sprinkles(random: Random, style: FoamStyle): InstancedMesh {
  const geometry = style === "bloom" ? petalFlake() : puff(random);
  const colours = style === "bloom" ? PROPS.petal : PROPS.fleck;
  const mesh = new InstancedMesh(geometry, toonMaterial({ highlight: 0.4 }), SPRINKLES.count);
  const euler = new Euler();
  const matrix = new Matrix4();
  for (let i = 0; i < SPRINKLES.count; i++) {
    const a = between(random, 0, Math.PI * 2);
    const r = SPRINKLES.reach * Math.sqrt(random());
    const position = new Vector3(r * Math.cos(a), surface(r) + 0.001, r * Math.sin(a));
    const tilt = new Quaternion().setFromEuler(euler.set(between(random, -0.5, 0.5), random() * 6.28, 0));
    const size = between(random, ...SPRINKLES.size) * (style === "bloom" ? 1 : 0.55);
    mesh.setMatrixAt(i, matrix.compose(position, tilt, new Vector3(size, size, size)));
    mesh.setColorAt(i, new Color(pick(random, colours)));
  }
  return mesh;
}
