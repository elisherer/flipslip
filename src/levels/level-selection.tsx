import { Bvh } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { PCFShadowMap } from "three";

import Stars from "@/components/starts";
import { LevelCarousel } from "@/levels/level-carousel";
import { useGameState } from "@/providers/game-state-provider";
import { SceneProvider } from "@/providers/scene-provider";
import { isLocalDev } from "@/utils/constants";

export function LevelSelection() {
  const [{ inLevel, debug, settings }] = useGameState();

  if (inLevel) {
    return null;
  }
  return (
    <>
      <LevelCarousel />
      <Canvas
        shadows={settings.hq ? { type: PCFShadowMap } : false}
        gl={{
          antialias: settings.hq,
          alpha: true,
        }}
        camera={{
          position: [0, 0, 1],
        }}
      >
        <Bvh firstHitOnly>
          {isLocalDev && debug && <Perf position="bottom-right" />}
          <SceneProvider>
            <Stars />
          </SceneProvider>
        </Bvh>
        <EffectComposer enabled={settings.hq}>
          <Bloom mipmapBlur />
        </EffectComposer>
      </Canvas>
    </>
  );
}
