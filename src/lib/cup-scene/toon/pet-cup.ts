import {
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  Mesh,
  type Texture,
  TorusGeometry,
  Vector2,
} from "three";
import petCup from "@/data/pet-cup.json";
import { CLEAR, clearPlastic, clearPrint, pouredDrink } from "./cups";
import { addOutlines } from "./outline";
import { DRINKS } from "./palette";

// The 350 ml clear PET cup (Ø84 / Ø49 × 120 mm, brandkit/in-an: line pet-trong), the coffee flavour's cup in the
// carousel. It has no GLB: it is turned here from its sizes (src/data/pet-cup.json, written by sync-brand), drawn
// as the PP cup is (clear plastic by alpha, its edge line in the shader), with its white print (the column of four
// marks and the name) wrapped on by the print file's own fan, as brandkit's blender_cups.py does for the GLB cups,
// and coldbrew poured in it. No lid (the menu's Coldbrew Bưởi). Metres, foot at y = 0, print front toward +z.

const MM = 0.001;
const SEGMENTS = 64;
/** The coffee's surface, metres above the foot (as the menu's render). */
const FILL = 0.106;
/** Draw order among the see-through parts, as cups.ts: the drink first, the wall and its print, the rim. */
const ORDER = { drink: 1, wall: 2, print: 2, rim: 3 };

const { top, bottom, height, fan } = petCup;
const rimR = (top / 2) * MM;
const footR = (bottom / 2) * MM;
const H = height * MM;
/** The wall's radius (metres) at a height (metres). */
const radiusAt = (y: number) => footR + ((rimR - footR) * y) / H;

/** The print band: each vertex's UV is its own point on the flat print fan (pet-cup.json → fan, mm). */
function printBand(): BufferGeometry {
  const { R, r, k, box } = fan;
  const theta = (fan.theta * Math.PI) / 180;
  const [x0, y0, w, h] = box;
  const zTop = fan.zone_top;
  const zBottom = zTop - (R - r) * k;
  const rows = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const z = zBottom + ((zTop - zBottom) * j) / rows; // mm above the foot
    const rho = R - (zTop - z) / k;
    const radius = radiusAt(z * MM) + 0.0003; // just over the wall
    for (let i = 0; i <= SEGMENTS; i++) {
      const phi = -theta / 2 + (theta * i) / SEGMENTS;
      const a = ((phi - fan.front) * 2 * Math.PI) / theta;
      positions.push(radius * Math.sin(a), z * MM, radius * Math.cos(a));
      const fx = rho * Math.sin(phi);
      const fy = -rho * Math.cos(phi);
      uvs.push((fx - x0) / w, 1 - (fy - y0) / h);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < SEGMENTS; i++) {
      const a = j * (SEGMENTS + 1) + i;
      const b = a + 1;
      const c = a + SEGMENTS + 1;
      const d = c + 1;
      index.push(a, b, d, a, d, c);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

function ring(radius: number, y: number, thick: number, material: ReturnType<typeof clearPlastic>): Mesh {
  const mesh = new Mesh(new TorusGeometry(radius, thick, 8, SEGMENTS), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = ORDER.rim;
  return mesh;
}

/** The PET cup with its coldbrew, toon and outlined; `print` is its print texture (null: a plain cup). */
export function createPetCup(print: Texture | null): Group {
  const group = new Group();
  group.name = "pet-350ml";
  const plastic = clearPlastic("pet-clear", CLEAR.body);
  const edge = clearPlastic("pet-rim", CLEAR.lid);
  const profile = [new Vector2(footR - 0.0012, 0), new Vector2(radiusAt(0.0025), 0.0025), new Vector2(rimR, H)];
  const wall = new Mesh(new LatheGeometry(profile, SEGMENTS), plastic);
  wall.renderOrder = ORDER.wall;
  const base = new Mesh(new CircleGeometry(footR - 0.0012, SEGMENTS), plastic);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.0012;
  base.renderOrder = ORDER.wall;
  group.add(
    wall,
    base,
    ring(rimR + 0.0004, H - 0.0006, 0.0016, edge), // the rolled rim
    ring(radiusAt(H - 0.017) + 0.0003, H - 0.017, 0.0005, edge), // the stacking ridge
    ring(radiusAt(0.005) + 0.0002, 0.005, 0.0004, edge), // the foot ring
  );
  if (print) {
    const band = new Mesh(printBand(), clearPrint("pet-print", print));
    band.renderOrder = ORDER.print;
    group.add(band);
  }
  const drinkTop = FILL;
  const drinkGeometry = new CylinderGeometry(radiusAt(drinkTop) - 0.001, footR - 0.001, drinkTop - 0.002, SEGMENTS);
  drinkGeometry.translate(0, 0.002 + (drinkTop - 0.002) / 2, 0);
  const drink = new Mesh(drinkGeometry, pouredDrink("pet-coldbrew", DRINKS.coldbrew, 0.002, drinkTop));
  drink.renderOrder = ORDER.drink;
  group.add(drink);
  group.traverse((object) => {
    if (object instanceof Mesh) object.castShadow = object.receiveShadow = true;
  });
  addOutlines(group);
  return group;
}

/** The PET cup's print URL (content-hashed by sync-brand). */
export const PET_PRINT_URL: string = petCup.texture;
