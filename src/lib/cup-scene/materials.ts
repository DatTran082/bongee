import { DoubleSide, type Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, type Object3D } from "three";

// The cup's materials for the web. The brand kit's GLB describes the PP cup and its lid with
// KHR_materials_transmission, which three.js renders with an extra pass of the whole scene: too heavy here. The
// wall and the lid are thin alpha-blended glass instead, clear, with the studio's reflections (the sample poster's
// look, rather than the kit's frosted finish), and the drink is the GLB's own, drawn as a still, translucent green:
// the grape tea, with the grapes and the ice standing in it showing through.

/** PP: the body, its rim and its base: clear with a trace of frost. */
const FROST = { opacity: 0.2, roughness: 0.1, envMapIntensity: 1.3 };
/** The grape tea: translucent, glossy, green. */
const TEA = { colour: "#b9dc4c", opacity: 0.78, roughness: 0.05, envMapIntensity: 1.1 };
/** The lid and its strap: clear and glossy. */
const CLEAR = { opacity: 0.3, roughness: 0.05, envMapIntensity: 1.6 };
/** Draw order among the translucent parts: the tea first, the body over it, the lid over the body. */
const ORDER: Readonly<Record<string, number>> = {
  "milk-tea": 1,
  "pp-frosted": 2,
  "lid-clear": 3,
  "lid-clear-plain": 4,
};

export interface CupMaterials {
  /** the drink: set its colour to change what the cup holds */
  readonly drink: MeshStandardMaterial;
}

function translucent(spec: typeof FROST, from: Material): MeshPhysicalMaterial {
  const material = new MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: spec.roughness,
    metalness: 0,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
    clearcoat: 1,
    clearcoatRoughness: spec.roughness,
    side: DoubleSide,
    envMapIntensity: spec.envMapIntensity,
  });
  if (from instanceof MeshStandardMaterial && from.normalMap) {
    material.normalMap = from.normalMap; // the embossed marks on the lid's top
    material.normalScale.copy(from.normalScale);
  }
  material.name = from.name;
  material.userData.ownEnvMap = true; // its envMapIntensity counts only with its own envMap (index.ts, environment())
  return material;
}

/** Swaps the model's materials for the web ones, in place; the drink's material is returned for colour changes. */
export function webMaterials(root: Object3D): CupMaterials {
  const replaced = new Map<Material, Material>();
  let drink: MeshStandardMaterial | null = null;
  const swap = (material: Material): Material => {
    const done = replaced.get(material);
    if (done) return done;
    let next: Material = material;
    if (material.name === "pp-frosted") next = translucent(FROST, material);
    else if (material.name === "lid-clear" || material.name === "lid-clear-plain") next = translucent(CLEAR, material);
    else if (material.name === "milk-tea") {
      const tea = new MeshPhysicalMaterial({
        color: TEA.colour,
        roughness: TEA.roughness,
        metalness: 0,
        transparent: true,
        opacity: TEA.opacity,
        depthWrite: false,
        clearcoat: 0.6,
        envMapIntensity: TEA.envMapIntensity,
      });
      tea.name = material.name;
      tea.userData.ownEnvMap = true;
      next = tea;
      drink = tea;
    }
    if (next !== material) {
      replaced.set(material, next);
      material.dispose();
    }
    return next;
  };
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = [object.material].flat().map(swap);
    object.material = Array.isArray(object.material) ? materials : materials[0];
    object.renderOrder = Math.max(...materials.map((m) => ORDER[m.name] ?? 0));
  });
  if (!drink)
    throw new Error('The cup model has no "milk-tea" material: rebuild brandkit/3d and run npm run sync-brand.');
  return { drink };
}
