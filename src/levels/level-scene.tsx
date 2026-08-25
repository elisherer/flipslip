import { IfInSessionMode } from "@react-three/xr";
import { useEffect } from "react";

import { Music } from "@/assets/sounds";
import BackgroundMusic from "@/components/BackgroundMusic";
import Lights from "@/components/lights";
import LevelRenderer from "@/levels/level-renderer";
import VRPlayerControls from "@/levels/vr-player-controls";
import { useGameState } from "@/providers/game-state-provider";
import LevelStateProvider from "@/providers/level-state-provider";
import { SceneProvider } from "@/providers/scene-provider";

export function LevelScene({ setCompleteDialogOpen }: { setCompleteDialogOpen: (state: boolean) => any }) {
  const [{ inLevel, levelIndex, invalidationFlag, debug }, gameApi] = useGameState();

  // a fresh/restarted level always starts uncompleted
  useEffect(() => {
    setCompleteDialogOpen(false);
  }, [levelIndex, invalidationFlag]);

  if (!inLevel) {
    return null;
  }

  return (
    <SceneProvider>
      <BackgroundMusic path={Music.LEVEL1} />
      <Lights />
      <LevelStateProvider>
        <LevelRenderer
          debug={debug}
          onFinishLevel={() => {
            gameApi.levelComplete(levelIndex);
            setCompleteDialogOpen(true);
          }}
        />
      </LevelStateProvider>
      <IfInSessionMode allow={["immersive-vr", "immersive-ar"]}>
        <VRPlayerControls />
      </IfInSessionMode>
    </SceneProvider>
  );
}
