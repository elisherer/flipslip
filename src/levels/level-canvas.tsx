import { Bvh } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { useEffect, useState } from "react";
import { PCFShadowMap } from "three";

import Lights from "@/components/lights";
import LevelCompleteModal from "@/components/modal/LevelCompleteModal";
import LevelRenderer from "@/levels/level-renderer";
import levelStyles from "@/levels/level.module.css";
import { Levels } from "@/levels/levels";
import { useGameState } from "@/providers/game-state-provider";
import LevelStateProvider from "@/providers/level-state-provider";
import { SceneProvider } from "@/providers/scene-provider";
import { isLocalDev } from "@/utils/constants";

export function LevelCanvas() {
  const [{ inLevel, levelIndex, invalidationFlag, debug, settings }, gameApi] = useGameState();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // a fresh/restarted level always starts uncompleted
  useEffect(() => {
    setCompleteDialogOpen(false);
  }, [levelIndex, invalidationFlag]);

  if (!inLevel) {
    return null;
  }

  return (
    <>
      <Canvas
        className={levelStyles.level}
        data-level={levelIndex}
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
          <Lights />
          <SceneProvider>
            <LevelStateProvider>
              <LevelRenderer
                debug={debug}
                onFinishLevel={() => {
                  gameApi.levelComplete(levelIndex);
                  setCompleteDialogOpen(true);
                }}
              />
            </LevelStateProvider>
          </SceneProvider>
        </Bvh>
        <EffectComposer enabled={settings.hq}>
          <Bloom mipmapBlur luminanceThreshold={0.3} intensity={0.3} levels={5} />
        </EffectComposer>
      </Canvas>
      <LevelCompleteModal
        open={completeDialogOpen}
        hasNextLevel={levelIndex < Levels.length - 1}
        onHome={() => gameApi.homeScreen()}
        onRestart={() => gameApi.levelInitialize()}
        onNext={() => gameApi.levelInitialize(levelIndex + 1)}
      />
    </>
  );
}
