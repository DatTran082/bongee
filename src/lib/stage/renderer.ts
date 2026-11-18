import { NeutralToneMapping, WebGPURenderer } from "three/webgpu";

export type Backend = "webgpu" | "webgl2";

export interface Gpu {
  readonly renderer: WebGPURenderer;
  readonly backend: Backend;
}

export interface GpuOptions {
  /** the WebGL 2 backend even where WebGPU works (the `?webgl` test switch) */
  readonly forceWebGL: boolean;
  /** ask for the faster GPU of a laptop that has two (the full tier only: it costs battery) */
  readonly highPerformance: boolean;
}

/**
 * The renderer: WebGPU where the browser has it, else WebGL 2; three.js falls back by itself and the shaders, written
 * in TSL, compile for either. Rejects when neither works: the caller keeps the page's photograph. Anti-aliasing is
 * the pipeline's (pipeline.ts), not the canvas's. The scene is drawn on transparent black, so its coverage is known
 * when the pipeline lays it over the page's white.
 */
export async function createGpu(canvas: HTMLCanvasElement, options: GpuOptions): Promise<Gpu> {
  const renderer = new WebGPURenderer({
    canvas,
    antialias: false,
    forceWebGL: options.forceWebGL,
    ...(options.highPerformance ? { powerPreference: "high-performance" as const } : {}),
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping; // Khronos PBR Neutral: the drinks keep their true colours
  try {
    await renderer.init();
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "webgpu" : "webgl2";
  return { renderer, backend };
}
