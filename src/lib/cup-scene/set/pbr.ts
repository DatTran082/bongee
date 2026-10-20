import {
  type Material,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";

// PBR textures for the set's props, from Poly Haven (CC0), fetched into public/textures/<asset>/ by
// scripts/fetch-textures.mjs. A material is returned at once and its maps arrive as they load, so the set builds
// without waiting; `onLoad` asks the stage for a frame when one lands.

export interface PbrSpec {
  /** the asset's folder under public/textures */
  readonly asset: string;
  /** tiles across one UV unit */
  readonly repeat: readonly [number, number];
  /** a tint over the diffuse (sRGB hex), white for none */
  readonly tint?: string;
  readonly roughness?: number;
  readonly normalScale?: number;
  /** a colour map of our own instead of the asset's diffuse */
  readonly diffuse?: Texture;
  /** leave the asset's roughness map out (a flat roughness instead) */
  readonly flatRoughness?: boolean;
  /**
   * turn the maps a quarter turn (a veneer's grain runs along the image; a log's runs up it) and use the colour
   * map as the bump instead of the normal map, which cannot be turned without re-encoding
   */
  readonly quarterTurn?: boolean;
  /** bump strength when `quarterTurn` (the colour map is the bump) */
  readonly bumpScale?: number;
}

const loader = new TextureLoader();

function texture(
  url: string,
  colour: boolean,
  repeat: readonly [number, number],
  onLoad: () => void,
  turn = false,
): Texture {
  const map = loader.load(url, onLoad);
  if (colour) map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.repeat.set(repeat[0], repeat[1]);
  map.anisotropy = 8;
  if (turn) {
    map.center.set(0.5, 0.5);
    map.rotation = Math.PI / 2;
  }
  return map;
}

/** A material with its diffuse, normal and roughness maps loading. */
export function pbrMaterial(spec: PbrSpec, onLoad: () => void): MeshStandardMaterial {
  const base = `/textures/${spec.asset}`;
  const turn = spec.quarterTurn ?? false;
  const map = spec.diffuse ?? texture(`${base}/diffuse.jpg`, true, spec.repeat, onLoad, turn);
  const material = new MeshStandardMaterial({
    color: spec.tint ?? "#ffffff",
    map,
    normalMap: turn ? null : texture(`${base}/normal.jpg`, false, spec.repeat, onLoad),
    bumpMap: turn ? map : null,
    bumpScale: spec.bumpScale ?? 1,
    roughnessMap: spec.flatRoughness ? null : texture(`${base}/rough.jpg`, false, spec.repeat, onLoad, turn),
    roughness: spec.roughness ?? 1,
  });
  material.normalScale.setScalar(spec.normalScale ?? 1);
  return material;
}

/** Frees a PBR material's maps with it. */
export function disposePbr(material: Material): void {
  for (const value of Object.values(material)) {
    if (value && typeof value === "object" && "isTexture" in value) (value as Texture).dispose();
  }
  material.dispose();
}
