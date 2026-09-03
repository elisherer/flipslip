import { IfInSessionMode } from "@react-three/xr";

import { Music } from "@/assets/sounds";
import BackgroundMusic from "@/components/audio/background-music";
import Lights from "@/components/lights";
import Stars from "@/components/starts";
import { LevelCarousel } from "@/levels/level-carousel";
import VRPlayerControls from "@/levels/vr-player-controls";
import { useGameState } from "@/providers/game-state-provider";
import { SceneProvider } from "@/providers/scene-provider";

export function LevelSelectionScene() {
  const [{ inLevel }] = useGameState();
  if (inLevel) {
    return null;
  }
  return (
    <SceneProvider>
      <BackgroundMusic path={Music.SELECTION} />
      <Stars />
      <IfInSessionMode allow={["immersive-ar", "immersive-vr"]}>
        <Lights />
        <LevelCarousel vr />
        <VRPlayerControls />
      </IfInSessionMode>
    </SceneProvider>
  );
}
