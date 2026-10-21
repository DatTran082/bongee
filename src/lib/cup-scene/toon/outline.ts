import {
  BackSide,
  type BufferGeometry,
  Color,
  InstancedMesh,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  type Object3D,
  Vector2,
} from "three";
import toon from "@/data/brand-toon.json";
import tokens from "@/data/brand-tokens.json";
import { outlineColour } from "./material";

// The toon outline, a sticker's: two inverted hulls round each mesh, copies drawn from behind and pushed out along
// their normals by a fixed number of screen pixels, so only a rim of each shows round the silhouette, the same width
// near or far. The inner hull is the clouds' warm white (toon.outline.widthPx), the outer one a thin line in a darker
// tone of the surface (edgePx more), which keeps the white edge visible on the page's cream. The hulls share the
// mesh's geometry (and an instanced mesh's instance matrices), so they cost two draw calls and no memory.

type Layer = "inner" | "outer";

/** Shared by every hull: the drawing buffer's size and the widths (device px), set on resize (setOutlineSize). */
const uniforms = {
  uOutlineResolution: { value: new Vector2(1, 1) },
  uOutlineInner: { value: toon.outline.widthPx },
  uOutlineOuter: { value: toon.outline.widthPx + toon.outline.edgePx },
};

/** Call when the drawing buffer changes size: `width` × `height` device px at `pixelRatio`. */
export function setOutlineSize(width: number, height: number, pixelRatio: number): void {
  uniforms.uOutlineResolution.value.set(width, height);
  uniforms.uOutlineInner.value = toon.outline.widthPx * pixelRatio;
  uniforms.uOutlineOuter.value = (toon.outline.widthPx + toon.outline.edgePx) * pixelRatio;
}

/** What an instanced copy's colour is multiplied by for its outer line: toon.outline.lightness, in linear light. */
const DARKEN = new Color().setScalar(toon.outline.lightness ** 2.2);
const INNER = new Color(tokens[toon.outline.inner as "cloud"]);

const materials = new Map<string, MeshBasicMaterial>();

/** One hull material per colour and layer (shared). */
function hullMaterial(colour: Color, layer: Layer): MeshBasicMaterial {
  const key = `${layer}-${colour.getHexString()}`;
  const known = materials.get(key);
  if (known) return known;
  const material = new MeshBasicMaterial({ color: colour, side: BackSide });
  if (layer === "outer") {
    // the outer hull lies at the inner one's depth: pushed back, it shows only beyond the white
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.polygonOffsetUnits = 4;
  }
  material.name = `outline-${key}`;
  const width = layer === "inner" ? "uOutlineInner" : "uOutlineOuter";
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform vec2 uOutlineResolution;\nuniform float ${width};`)
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
{
  vec3 hullNormal = normal;
  #ifdef USE_INSTANCING
    hullNormal = mat3( instanceMatrix ) * hullNormal;
  #endif
  vec2 clipNormal = ( projectionMatrix * vec4( normalMatrix * hullNormal, 0.0 ) ).xy;
  clipNormal /= max( length( clipNormal ), 1e-5 );
  gl_Position.xy += clipNormal / uOutlineResolution * ${width} * gl_Position.w * 2.0;
}`,
      );
  };
  material.customProgramCacheKey = () => `toon-outline-${layer}`;
  materials.set(key, material);
  return material;
}

/** The geometry a hull is made of: the mesh's own, or a welded skin it carries for that (geometry.userData.hull). */
function skin(mesh: Mesh): BufferGeometry {
  return (mesh.geometry.userData.hull as BufferGeometry | undefined) ?? mesh.geometry;
}

function baseColour(material: Material): Color | null {
  if (material instanceof MeshToonMaterial) return material.color;
  if (material instanceof MeshBasicMaterial) return material.color;
  return null;
}

function hull(mesh: Mesh, colour: Color, layer: Layer, tinted: boolean): Mesh {
  let made: Mesh;
  if (mesh instanceof InstancedMesh) {
    const instanced = new InstancedMesh(skin(mesh), hullMaterial(colour, layer), mesh.count);
    instanced.instanceMatrix = mesh.instanceMatrix;
    if (tinted) instanced.instanceColor = mesh.instanceColor;
    made = instanced;
  } else {
    made = new Mesh(skin(mesh), hullMaterial(colour, layer));
  }
  made.userData.outline = true;
  made.frustumCulled = mesh.frustumCulled;
  made.castShadow = false;
  made.renderOrder = mesh.renderOrder;
  return made;
}

/**
 * Gives every toon mesh under `root` its two hulls (once: a mesh that has them, or is one, is skipped; so is one
 * whose material says `userData.noOutline`, for flecks too small to carry a line). `skip` leaves out a mesh by name
 * (a print layer lying on its cup's wall, whose own hulls would double the cup's).
 */
export function addOutlines(root: Object3D, skip: (mesh: Mesh) => boolean = () => false): void {
  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof Mesh && !object.userData.outline && !object.userData.hasOutline && !skip(object)) {
      meshes.push(object);
    }
  });
  for (const mesh of meshes) {
    const material = [mesh.material].flat()[0];
    const base = material && baseColour(material);
    if (!base || material.userData.noOutline) continue;
    const own: Color | undefined = material.userData.outlineColour;
    // instanced copies coloured one by one: the outer line darkens each copy's own colour
    const tinted = !own && mesh instanceof InstancedMesh && mesh.instanceColor !== null;
    const outer = own ?? (tinted ? DARKEN : outlineColour(base));
    mesh.userData.hasOutline = true;
    mesh.add(hull(mesh, INNER, "inner", false), hull(mesh, outer, "outer", tinted));
  }
}
