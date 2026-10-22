import {
  Color,
  type ColorRepresentation,
  DataTexture,
  DoubleSide,
  LinearFilter,
  MeshToonMaterial,
  RGBAFormat,
  type Texture,
  Vector3,
} from "three";
import toon from "@/data/brand-toon.json";
import tokens from "@/data/brand-tokens.json";

// The stage's one material, after the Làng Mây edition's toon rules (brandkit-ghibli/color/tokens.json → toon,
// copied to src/data/brand-toon.json by sync-brand): smooth shapes lit in three soft-edged bands, as a brush paints
// them (toon.softness), the shade side cooled toward lilac by the hemisphere light (index.ts), a flat white
// highlight where the surface mirrors the key light (on a cup, a narrow upright stripe), and a faint rim of light on
// the silhouette. A drink can be poured in layers instead of one colour: three bands, darkest at the foot, their
// borders waving round the cup so they run slanted across its face.

/** Brightness of the bands, shade to light, and where they change (on N·L mapped to 0 … 1). */
const BANDS = { levels: [0.62, 0.84, 1] as const, edges: [0.44, 0.68] as const };
const GRADIENT_PX = 256;

let gradient: DataTexture | null = null;

/** The bands as a small texture with soft steps (shared by every toon material). */
function gradientMap(): DataTexture {
  if (gradient) return gradient;
  const half = toon.softness / 2;
  const smooth = (edge: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - (edge - half)) / (2 * half)));
    return t * t * (3 - 2 * t);
  };
  const [shade, mid, lit] = BANDS.levels;
  const data = new Uint8Array(GRADIENT_PX * 4);
  for (let i = 0; i < GRADIENT_PX; i++) {
    const x = i / (GRADIENT_PX - 1);
    const v = shade + (mid - shade) * smooth(BANDS.edges[0], x) + (lit - mid) * smooth(BANDS.edges[1], x);
    data.set([v * 255, v * 255, v * 255, 255], i * 4);
  }
  gradient = new DataTexture(data, GRADIENT_PX, 1, RGBAFormat);
  gradient.minFilter = gradient.magFilter = LinearFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

/** A drink poured in layers, in its mesh's own space: colours foot to top, its height range, its axis (x, z). */
export interface DrinkLayers {
  readonly colours: readonly [ColorRepresentation, ColorRepresentation, ColorRepresentation];
  readonly y0: number;
  readonly y1: number;
  readonly axis: readonly [number, number];
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
  /** the rim of light on the silhouette (default toon.rim.strength; 0 for matte paper, which has none) */
  readonly rim?: number;
  /**
   * For see-through surfaces: their outline drawn in the shader, where the surface turns edge-on to the eye, in this
   * colour (an outline hull behind clear plastic would show through it as a solid band).
   */
  readonly edge?: ColorRepresentation;
  readonly layers?: DrinkLayers;
  readonly doubleSided?: boolean;
  readonly name?: string;
}

const HIGHLIGHT = { threshold: toon.highlight.threshold, soft: 0.004 };
/** The layers' borders: share of the height each wave rises and falls, and how soft the border is. */
const LAYER = { wave: toon.drink.wave, soft: 0.018 };
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
  material.name = options.name ?? "";
  const layers = options.layers;
  const uniforms = {
    uHighlight: { value: HIGHLIGHT.threshold },
    uHighlightStrength: { value: options.highlight ?? 1 },
    uHighlightColour: { value: new Color(tokens.cloud) },
    uRimColour: { value: RIM.colour },
    uRimStrength: { value: options.rim ?? RIM.strength },
    uLayer0: { value: new Color(layers?.colours[0] ?? "#ffffff") },
    uLayer1: { value: new Color(layers?.colours[1] ?? "#ffffff") },
    uLayer2: { value: new Color(layers?.colours[2] ?? "#ffffff") },
    uLayerRange: { value: new Vector3(layers?.y0 ?? 0, layers?.y1 ?? 1, LAYER.wave) },
    uLayerAxis: { value: [layers?.axis[0] ?? 0, layers?.axis[1] ?? 0] },
    uEdgeColour: { value: new Color(options.edge ?? "#000000") },
  };
  const edged = options.edge === undefined ? 0 : 1;
  const poured = layers ? 1 : 0;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vToonPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvToonPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vToonPos;
uniform float uHighlight;
uniform float uHighlightStrength;
uniform vec3 uHighlightColour;
uniform vec3 uRimColour;
uniform float uRimStrength;
uniform vec3 uLayer0;
uniform vec3 uLayer1;
uniform vec3 uLayer2;
uniform vec3 uLayerRange;
uniform vec2 uLayerAxis;
uniform vec3 uEdgeColour;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
#if ${poured}
{
  float around = atan( vToonPos.z - uLayerAxis.y, vToonPos.x - uLayerAxis.x );
  float t = ( vToonPos.y - uLayerRange.x ) / ( uLayerRange.y - uLayerRange.x );
  float wave = uLayerRange.z * ( sin( around + 0.6 ) + 0.35 * sin( 2.0 * around + 1.9 ) );
  vec3 layer = mix( uLayer0, uLayer1, smoothstep( 0.36 - ${LAYER.soft}, 0.36 + ${LAYER.soft}, t + wave ) );
  layer = mix( layer, uLayer2, smoothstep( 0.68 - ${LAYER.soft}, 0.68 + ${LAYER.soft}, t - 0.8 * wave ) );
  diffuseColor.rgb *= layer;
}
#endif`,
      )
      .replace(
        "#include <opaque_fragment>",
        `{
  float toonLit = 0.0;
  #if NUM_DIR_LIGHTS > 0
    vec3 toonHalf = normalize( directionalLights[ 0 ].direction + geometryViewDir );
    float facing = dot( normal, toonHalf );
    toonLit = smoothstep( uHighlight - ${HIGHLIGHT.soft}, uHighlight + ${HIGHLIGHT.soft}, facing ) * uHighlightStrength;
  #endif
  float toonRim = smoothstep( 0.62, 0.7, 1.0 - saturate( dot( normal, geometryViewDir ) ) ) * uRimStrength;
  outgoingLight = mix( outgoingLight, uHighlightColour, toonLit );
  outgoingLight += uRimColour * toonRim;
  diffuseColor.a = max( diffuseColor.a, max( toonLit, toonRim * 0.5 ) );
  #if ${edged}
  {
    float toonEdge = 1.0 - smoothstep( 0.1, 0.18, abs( dot( normal, geometryViewDir ) ) );
    outgoingLight = mix( outgoingLight, uEdgeColour, toonEdge );
    diffuseColor.a = max( diffuseColor.a, toonEdge * 0.9 );
  }
  #endif
}
#include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `toon-${poured}-${edged}`;
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
