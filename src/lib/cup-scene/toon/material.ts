import {
  Color,
  type ColorRepresentation,
  DataTexture,
  DoubleSide,
  MeshToonMaterial,
  NearestFilter,
  RGBAFormat,
  type Texture,
} from "three";
import toon from "@/data/brand-toon.json";
import tokens from "@/data/brand-tokens.json";

// The stage's one material, after the Làng Mây edition's toon rules (brandkit-ghibli/color/tokens.json → toon,
// copied to src/data/brand-toon.json by sync-brand): flat-shaded facets (each face one colour), light in a few hard
// bands, the shade side cooled toward lilac by the hemisphere light (index.ts), a flat white highlight painted on
// the facets that face the key light's mirror direction, and a thin rim of light on the silhouette. A drink can
// also fade from one colour at its foot to another at its top, as a game asset's liquid does.

/** Brightness of each band, dark to light; the shading picks one by how squarely a face meets the key light. */
const BANDS = [0.52, 0.52, 0.8, 1, 1];

let gradient: DataTexture | null = null;

/** The bands as a tiny texture, nearest-filtered so the steps stay hard (shared by every toon material). */
function gradientMap(): DataTexture {
  if (gradient) return gradient;
  const data = new Uint8Array(BANDS.flatMap((v) => [v * 255, v * 255, v * 255, 255]));
  gradient = new DataTexture(data, BANDS.length, 1, RGBAFormat);
  gradient.minFilter = gradient.magFilter = NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

export interface ToonOptions {
  readonly color?: ColorRepresentation;
  readonly map?: Texture | null;
  /** below 1: see-through (clear plastic, ice); the highlight stays opaque */
  readonly opacity?: number;
  readonly alphaTest?: number;
  readonly vertexColors?: boolean;
  /** 0 … 1: how strongly the white highlight shows (0: none) */
  readonly highlight?: number;
  /** a vertical fade, in the mesh's own space: `bottom` at y0, `top` at y1, multiplied into the colour */
  readonly fade?: { readonly bottom: ColorRepresentation; readonly top: ColorRepresentation; y0: number; y1: number };
  readonly doubleSided?: boolean;
  readonly name?: string;
}

const HIGHLIGHT = toon.highlight.threshold;
/** An outline's most saturation (HSL): its colour stays soft, as the brand kit's outlines are. */
const OUTLINE_MAX_SATURATION = 0.42;
/** The outline of anything near white: pink-700 cooled toward the clouds' lilac shade, a step darker. */
const NEAR_WHITE = new Color(tokens["pink-700"]).lerp(new Color("#9C8FB0"), 0.35);
const RIM = { colour: new Color(tokens.cloud), strength: toon.rim.strength };

/** A toon material for the stage (see the file's head). */
export function toonMaterial(options: ToonOptions = {}): MeshToonMaterial {
  const opacity = options.opacity ?? 1;
  const material = new MeshToonMaterial({
    color: options.color ?? "#ffffff",
    map: options.map ?? null,
    gradientMap: gradientMap(),
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
    alphaTest: options.alphaTest ?? 0,
    vertexColors: options.vertexColors ?? false,
    ...(options.doubleSided ? { side: DoubleSide } : {}),
  });
  material.defines = { FLAT_SHADED: "" }; // each face one colour (MeshToonMaterial has no flatShading flag)
  material.name = options.name ?? "";
  const uniforms = {
    uHighlight: { value: HIGHLIGHT },
    uHighlightStrength: { value: options.highlight ?? 1 },
    uHighlightColour: { value: new Color(tokens.cloud) },
    uRimColour: { value: RIM.colour },
    uRimStrength: { value: RIM.strength },
    uFadeBottom: { value: new Color(options.fade?.bottom ?? "#ffffff") },
    uFadeTop: { value: new Color(options.fade?.top ?? "#ffffff") },
    uFadeRange: { value: [options.fade?.y0 ?? 0, options.fade?.y1 ?? 1] },
  };
  const fade = options.fade ? 1 : 0;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vToonY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvToonY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying float vToonY;
uniform float uHighlight;
uniform float uHighlightStrength;
uniform vec3 uHighlightColour;
uniform vec3 uRimColour;
uniform float uRimStrength;
uniform vec3 uFadeBottom;
uniform vec3 uFadeTop;
uniform vec2 uFadeRange;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
#if ${fade}
  diffuseColor.rgb *= mix( uFadeBottom, uFadeTop, smoothstep( uFadeRange.x, uFadeRange.y, vToonY ) );
#endif`,
      )
      .replace(
        "#include <opaque_fragment>",
        `{
  float toonLit = 0.0;
  #if NUM_DIR_LIGHTS > 0
    vec3 toonHalf = normalize( directionalLights[ 0 ].direction + geometryViewDir );
    toonLit = step( uHighlight, dot( normal, toonHalf ) ) * uHighlightStrength;
  #endif
  float toonRim = smoothstep( 0.6, 0.64, 1.0 - saturate( dot( normal, geometryViewDir ) ) ) * uRimStrength;
  outgoingLight = mix( outgoingLight, uHighlightColour, toonLit );
  outgoingLight += uRimColour * toonRim;
  diffuseColor.a = max( diffuseColor.a, max( toonLit, toonRim * 0.6 ) );
}
#include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `toon-${fade}`;
  return material;
}

/**
 * The outline's colour for a surface of colour `base`: the same hue, darker and a little richer (toon.outline), never
 * black. Near-white surfaces (paper, white lids, clouds, clear plastic: their hue means nothing) take a soft
 * rose-lilac instead.
 */
export function outlineColour(base: ColorRepresentation): Color {
  const colour = new Color(base);
  const hsl = { h: 0, s: 0, l: 0 };
  colour.getHSL(hsl);
  if (hsl.l > 0.9 || (hsl.s < 0.12 && hsl.l > 0.8)) return new Color(NEAR_WHITE);
  // saturation capped: darkening a light, warm colour in HSL alone turns it loud (cream to gold, pink to red)
  const saturation = Math.min(OUTLINE_MAX_SATURATION, hsl.s * toon.outline.saturation);
  return colour.setHSL(hsl.h, saturation, hsl.l * toon.outline.lightness);
}
