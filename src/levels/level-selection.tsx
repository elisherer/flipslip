import { Bvh } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { PCFShadowMap } from "three";

import Water from "@/components/Water";
import { LevelCarousel } from "@/levels/level-carousel";
import { useGameState } from "@/providers/game-state-provider";
import { SceneProvider } from "@/providers/scene-provider";
import { isLocalDev } from "@/utils/constants";

const CAMERA_LOCATION: [x: number, y: number, z: number] = [0, 5, 5];

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
          near: 0.1,
          far: 500,
        }}
      >
        <Bvh firstHitOnly>
          {isLocalDev && debug && <Perf position="bottom-right" />}
          <directionalLight
            castShadow
            position={[0, 5, 5]}
            target-position={[0, 0, 0]}
            shadow-normalBias={0.05}
            shadow-mapSize={[2048, 2048]}
            intensity={1}
            shadow-camera-top={20}
            shadow-camera-bottom={-8}
            shadow-camera-left={-18}
            shadow-camera-right={18}
          />
          <SceneProvider initialPosition={CAMERA_LOCATION}>
            <Water args={[40, 10, 40, 10]} />
          </SceneProvider>
        </Bvh>
        <EffectComposer enabled={settings.hq}>
          <Bloom mipmapBlur luminanceThreshold={0.3} intensity={0.3} levels={5} />
        </EffectComposer>
      </Canvas>
    </>
  );
}
