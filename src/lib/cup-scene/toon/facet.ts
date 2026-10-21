import { type BufferGeometry, Matrix4, Mesh, type Object3D, Vector3 } from "three";
import { facetPoint } from "./facet-math";

/**
 * Turns a revolved model (a cup, its lid, its drink) into a low-poly one with `sides` flat sides about its own
 * vertical axis (the root's y axis), in place: every vertex moves onto the polygon (facet-math.ts), keeping its UVs,
 * so the print stays where it was. Parts that are not revolved (the strap, the pins) follow the same squeeze. Smooth
 * normals are kept: the toon material shades the faces flat on its own, and the outline hull needs them smooth.
 */
export function facet(root: Object3D, sides: number): void {
  root.updateMatrixWorld(true);
  const toRoot = new Matrix4();
  const back = new Matrix4();
  const rootInverse = root.matrixWorld.clone().invert();
  const p = new Vector3();
  const done = new Set<BufferGeometry>();
  root.traverse((object) => {
    if (!(object instanceof Mesh) || done.has(object.geometry)) return;
    done.add(object.geometry);
    toRoot.multiplyMatrices(rootInverse, object.matrixWorld);
    back.copy(toRoot).invert();
    const position = object.geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i).applyMatrix4(toRoot);
      const [x, z] = facetPoint(p.x, p.z, sides);
      p.set(x, p.y, z).applyMatrix4(back);
      position.setXYZ(i, p.x, p.y, p.z);
    }
    position.needsUpdate = true;
    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();
  });
}
