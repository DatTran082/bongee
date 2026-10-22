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
import { outlineColour } from "./material";

// The toon outline: one fine line round each mesh, in a darker tone of its own colour (never black). It is an inverted
// hull, a copy of the mesh drawn from behind and pushed out along its normals by a fixed number of screen pixels
// (toon.outline.widthPx), so only a rim of it shows round the silhouette, the same width near or far. No white
// sticker band and no rim of light (the owner, 22/10/2026: they made everything look like glass). The hull shares
// the mesh's geometry (and an instanced mesh's instance matrices), so it costs a draw call and no memory.

/** Shared by every hull: the drawing buffer's size and the width (device px), set on resize (setOutlineSize). */
const uniforms = {
  uOutlineResolution: { value: new Vector2(1, 1) },
  uOutlineWidth: { value: toon.outline.widthPx },
};

/** Call when the drawing buffer changes size: `width` × `height` device px at `pixelRatio`. */
export function setOutlineSize(width: number, height: number, pixelRatio: number): void {
  uniforms.uOutlineResolution.value.set(width, height);
  uniforms.uOutlineWidth.value = toon.outline.widthPx * pixelRatio;
}

/** What an instanced copy's colour is multiplied by for its outline: toon.outline.lightness, in linear light. */
const DARKEN = new Color().setScalar(toon.outline.lightness ** 2.2);

const materials = new Map<string, MeshBasicMaterial>();

/** One hull material per colour (shared). */
function hullMaterial(colour: Color): MeshBasicMaterial {
  const key = colour.getHexString();
  const known = materials.get(key);
  if (known) return known;
  const material = new MeshBasicMaterial({ color: colour, side: BackSide });
  material.name = `outline-${key}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec2 uOutlineResolution;\nuniform float uOutlineWidth;")
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
  gl_Position.xy += clipNormal / uOutlineResolution * uOutlineWidth * gl_Position.w * 2.0;
}`,
      );
  };
  material.customProgramCacheKey = () => "toon-outline";
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

/**
 * Gives every toon mesh under `root` its outline (once: a mesh that has one, or is one, is skipped; so is one whose
 * material says `userData.noOutline`, for flecks too small to carry a line). `skip` leaves out a mesh by name (a
 * print layer lying on its cup's wall, whose own hull would double the cup's).
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
    // instanced copies coloured one by one: the line darkens each copy's own colour
    const tinted = !own && mesh instanceof InstancedMesh && mesh.instanceColor !== null;
    const colour = own ?? (tinted ? DARKEN : outlineColour(base));
    let hull: Mesh;
    if (mesh instanceof InstancedMesh) {
      const instanced = new InstancedMesh(skin(mesh), hullMaterial(colour), mesh.count);
      instanced.instanceMatrix = mesh.instanceMatrix;
      if (tinted) instanced.instanceColor = mesh.instanceColor;
      hull = instanced;
    } else {
      hull = new Mesh(skin(mesh), hullMaterial(colour));
    }
    hull.userData.outline = true;
    hull.frustumCulled = mesh.frustumCulled;
    hull.castShadow = false;
    hull.renderOrder = mesh.renderOrder;
    mesh.userData.hasOutline = true;
    mesh.add(hull);
  }
}
