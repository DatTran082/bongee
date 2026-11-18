import { fxaa } from "three/addons/tsl/display/FXAANode.js";
import { traa } from "three/addons/tsl/display/TRAANode.js";
import {
  type Camera,
  NeutralToneMapping,
  RenderPipeline,
  type Scene,
  SRGBColorSpace,
  type WebGPURenderer,
} from "three/webgpu";
import { max, mix, mrt, output, pass, renderOutput, vec3, vec4, velocity } from "three/tsl";
import type { Tier } from "@/lib/cup-scene/quality";

/**
 * The stage's post-processing (docs/interactive-landing-script.md §5). The scene is drawn on transparent black, tone
 * mapped (Khronos PBR Neutral) and only then laid over white, so every pixel the scene leaves empty is exactly the
 * page's #FFFFFF: tone mapping white itself would grey it. Edges are smoothed last, on that finished picture: the
 * full tier with temporal anti-aliasing (TRAA, which also calms the silver's sheen; it keeps no alpha, hence after
 * the white), lighter tiers with FXAA, which costs less. No bloom, no flare: the silver may shine, never sparkle.
 */
export function createPipeline(renderer: WebGPURenderer, scene: Scene, camera: Camera, tier: Tier): RenderPipeline {
  const pipeline = new RenderPipeline(renderer);
  pipeline.outputColorTransform = false; // tone mapping and sRGB happen below, before the white
  const scenePass = pass(scene, camera);
  if (tier === "full") scenePass.setMRT(mrt({ output, velocity }));
  const colour = scenePass.getTextureNode("output");
  const coverage = colour.a;
  // the pass's edges are premultiplied by their coverage: undo it before tone mapping, then lay the result on white
  const straight = vec4(colour.rgb.div(max(coverage, 1e-4)), 1);
  const shaded = renderOutput(straight, NeutralToneMapping, SRGBColorSpace);
  const onWhite = vec4(mix(vec3(1), shaded.rgb, coverage), 1);
  pipeline.outputNode =
    tier === "full"
      ? traa(onWhite, scenePass.getTextureNode("depth"), scenePass.getTextureNode("velocity"), camera)
      : fxaa(onWhite);
  return pipeline;
}
