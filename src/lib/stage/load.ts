import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Object3D } from "three/webgpu";

/** Fetches a GLB (abortable: an unmount mid-download stops it) and parses it. */
export async function loadGlb(url: string, signal: AbortSignal): Promise<Object3D> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  signal.throwIfAborted();
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer, "");
  return gltf.scene;
}

/** The named node of a model, or an error that says how to get it back. */
export function required(root: Object3D, name: string, url: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`${url} has no "${name}" node: rebuild brandkit/print/3d and run npm run sync-models.`);
  return node;
}
