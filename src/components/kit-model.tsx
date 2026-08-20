import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph, useLoader } from "@react-three/fiber";
import { ComponentProps, forwardRef, useEffect, useMemo } from "react";
import {
  Group,
  Loader,
  LoopOnce,
  LoopRepeat,
  Material,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  SkinnedMesh,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import { PropsWithKitModel } from "@/assets/kit";

const ColorMapVariations: Record<string, { [p: string]: Material }> = {}; // cache

function renderChildren(
  context: any,
  materials: Record<string, Material>,
  children?: Object3D[] | null,
  receiveShadow?: boolean,
) {
  return children?.map((node, index) => {
    if (node.name === "root") {
      context.rootIsADescendant = true;
    }
    if ((node as SkinnedMesh).isSkinnedMesh) {
      const m = node as SkinnedMesh;
      return (
        <skinnedMesh
          key={node.uuid ?? node.name ?? `node_${index}`}
          name={node.name}
          castShadow
          receiveShadow={receiveShadow ?? true}
          position={node.position}
          rotation={node.rotation}
          geometry={m.geometry}
          material={Array.isArray(m.material) ? m.material.map(x => materials?.[x.name]) : materials[m.material.name]}
          skeleton={m.skeleton}
          scale={m.scale}
        >
          {renderChildren(context, materials, node.children)}
        </skinnedMesh>
      );
    } else if ((node as Mesh).isMesh) {
      const m = node as Mesh;
      return (
        <mesh
          key={node.uuid ?? node.name ?? `node_${index}`}
          name={node.name}
          castShadow
          receiveShadow={receiveShadow ?? true}
          position={node.position}
          rotation={node.rotation}
          geometry={m.geometry}
          material={Array.isArray(m.material) ? m.material.map(x => materials?.[x.name]) : materials[m.material.name]}
          scale={m.scale}
        >
          {renderChildren(context, materials, node.children)}
        </mesh>
      );
    } else if ((node as Group).isGroup || node.type === "Object3D") {
      return (
        <group
          key={node.uuid ?? node.name ?? `node_${index}`}
          name={node.name}
          castShadow
          receiveShadow={receiveShadow ?? true}
          position={node.position}
          rotation={node.rotation}
          scale={node.scale}
        >
          {renderChildren(context, materials, node.children)}
        </group>
      );
    }
    return (
      <primitive key={node.uuid ?? node.name ?? `node_${index}`} object={node}>
        {renderChildren(context, materials, node.children)}
      </primitive>
    );
  });
}

const EMPTY_TEXTURE = new Texture();
class NoLoader extends Loader<Texture> {
  load(
    _url: string,
    onLoad: (data: Texture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    _onError?: (err: unknown) => void,
  ) {
    /* nothing */
    onLoad(EMPTY_TEXTURE);
  }
}

export type KitModelProps = PropsWithKitModel<{
  animate?: string;
  loop?: boolean;
  animationTimeScale?: number;
  onAnimationFinished?: (e: any) => any; // EXPERIMENTAL
  color?: string;
  opacity?: number;
}> &
  ComponentProps<"group">;

export default forwardRef<Object3D | undefined, KitModelProps>(function KitModel(
  {
    kit = "block-bits",
    model,
    animate,
    loop,
    animationTimeScale = 1,
    onAnimationFinished,
    variant,
    color,
    opacity,
    children,
    ...props
  },
  ref,
) {
  let url = `/assets/kits/${kit}/${model.endsWith(".gltf") ? model : model + ".glb"}`;
  if (color) {
    if (variant) {
      url += `?variant=${encodeURIComponent(variant)}&color=${encodeURIComponent(color)}`;
    } else {
      url += `?color=${encodeURIComponent(color)}`;
    }
  } else if (variant) {
    url += `?variant=${encodeURIComponent(variant)}`;
  }
  const { scene, animations } = useGLTF(url);

  // Skinned characters keep their skeleton in drei's shared useGLTF cache, so
  // rendering the same model in two places (e.g. the LevelSelection player and a
  // Level player across a level transition) makes both mounts share one set of
  // bones. A SkinnedMesh renders at its skeleton's bone positions, not its parent
  // group's, and whichever instance unmounts last detaches those bones from the
  // live scene graph — freezing the visible mesh while its rapier body keeps
  // moving. Clone skinned scenes per instance so each owns an independent skeleton.
  const instance = useMemo(() => {
    let skinned = false;
    scene.traverse(o => {
      if ((o as SkinnedMesh).isSkinnedMesh) skinned = true;
    });
    return skinned ? (cloneSkeleton(scene) as Group) : scene;
  }, [scene]);
  const { nodes, materials } = useGraph(instance);
  const { actions, ref: animRef } = useAnimations(
    animations,
    ref && "current" in ref ? ref?.current || undefined : undefined,
  );

  const alternateTexture = useLoader(
    variant ? TextureLoader : NoLoader,
    `/assets/kits/${kit}/Textures/variation-${variant}.png`,
  );
  let variantMaterials: { [p: string]: Material } | undefined;
  if (variant || opacity || color) {
    const key = `${url}&opacity=${opacity ?? 1}`;
    if (ColorMapVariations[key]) {
      variantMaterials = ColorMapVariations[key];
    } else {
      const variantMaterialKey = Object.keys(materials)[0];
      const varMat = materials[variantMaterialKey].clone() as MeshStandardMaterial;
      variantMaterials = {
        ...materials,
        [variantMaterialKey]: varMat,
      };
      if (variant) {
        const texture = varMat.map?.clone();
        if (texture) {
          texture.image = alternateTexture.image;
          varMat.map = texture;
          varMat.needsUpdate = true;
        }
      }
      if (color) {
        varMat.color.set(color);
      }
      if (opacity) {
        varMat.opacity = opacity;
        varMat.transparent = true;
      }
      ColorMapVariations[key] = variantMaterials;
    }
  }

  useEffect(() => {
    if (!animate) return;
    const action = actions[animate];
    if (action) {
      action.clampWhenFinished = true; // stop on last frame
      action.setEffectiveTimeScale(animationTimeScale);
      if (loop) {
        action.setLoop(LoopRepeat, Infinity);
      } else {
        action.setLoop(LoopOnce, 1);
      }
      action.reset().fadeIn(0.2).play();
      if (onAnimationFinished) {
        const mixer = action.getMixer();
        mixer.addEventListener("finished", onAnimationFinished);
      }
      return () => {
        action.fadeOut(0.2);
        if (onAnimationFinished) {
          const mixer = action.getMixer();
          mixer.removeEventListener("finished", onAnimationFinished);
        }
      };
    }
  }, [animate, actions, loop, onAnimationFinished, animationTimeScale]);

  // get children (shallow)
  const childMeshes = useMemo(() => {
    const context: any = {
      rootIsADescendant: false,
    };
    return {
      context,
      content: (
        <group name={instance.name}>
          {renderChildren(context, variantMaterials ?? materials, instance.children, props.receiveShadow)}
        </group>
      ),
    };
  }, [instance.name, instance.children, variant, variantMaterials, props.receiveShadow]);

  const modelPosition = useMemo(() => {
    if (!instance.position.x && !instance.position.y && !instance.position.z) return null;
    return new Vector3(-instance.position.x, -instance.position.y, -instance.position.z);
  }, [instance.position]);

  return (
    <group ref={animRef as any} {...props} dispose={null}>
      {modelPosition ? (
        <group name="_fix_position" position={modelPosition}>
          {!childMeshes.context.rootIsADescendant && nodes.root && <primitive object={nodes.root} />}
          {childMeshes.content}
          {children}
        </group>
      ) : (
        <>
          {!childMeshes.context.rootIsADescendant && nodes.root && <primitive object={nodes.root} />}
          {childMeshes.content}
          {children}
        </>
      )}
    </group>
  );
});
