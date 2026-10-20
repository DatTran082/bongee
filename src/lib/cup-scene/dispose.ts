import { InstancedMesh, LightShadow, type Material, Mesh, type Scene, Sprite, Texture } from "three";

/** Frees every geometry, material, texture and shadow map in the scene (shared ones once; three ignores repeats). */
export function disposeScene(scene: Scene): void {
  const materials = new Set<Material>();
  scene.traverse((object) => {
    if ("shadow" in object && object.shadow instanceof LightShadow) object.shadow.dispose();
    if (object instanceof Sprite) {
      materials.add(object.material);
      return;
    }
    if (!(object instanceof Mesh)) return;
    if (object instanceof InstancedMesh) object.dispose(); // its instance buffers
    object.geometry.dispose();
    for (const material of [object.material].flat()) materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) value.dispose();
    }
    material.dispose();
  }
  scene.environment?.dispose();
}
