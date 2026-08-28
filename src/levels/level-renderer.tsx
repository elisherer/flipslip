import { useXR } from "@react-three/xr";
import { useEffect } from "react";
import useSound from "use-sound";

import { Sounds } from "@/assets/sounds";
import Stars from "@/components/starts";
import XrButton from "@/components/xr/xr-button";
import LevelGeometry from "@/levels/level-geometry";
import { Levels } from "@/levels/levels";
import Player from "@/levels/player";
import PlayerCameraFollow from "@/levels/player-camera-follow";
import { useGameState } from "@/providers/game-state-provider";
import { useLevelState } from "@/providers/level-state-provider";

type LevelProps = {
  debug?: boolean;
  onFinishLevel: () => void;
};

export default function LevelRenderer({ onFinishLevel }: LevelProps) {
  const [{ levelIndex, debug }, gameApi] = useGameState();
  const [{ level, toggled, lastTriggerCell, completed }] = useLevelState();
  const [playClick] = useSound(Sounds.CLICK);
  const [playUnclick] = useSound(Sounds.UNCLICK);
  const [playSwitch] = useSound(Sounds.SWITCH);
  const isVRMode = useXR(state => state.mode === "immersive-vr" || state.mode === "immersive-ar");

  useEffect(() => {
    if (!lastTriggerCell) return;
    if (lastTriggerCell.trigger === 3 || lastTriggerCell.trigger === 4) {
      playSwitch();
    } else {
      toggled ? playClick() : playUnclick();
    }
  }, [toggled, lastTriggerCell]);

  useEffect(() => {
    if (completed) onFinishLevel();
  }, [completed]);

  return (
    <>
      {isVRMode ? (
        <>
          <XrButton
            position={[0, -5, -level.height / 2 - 8]}
            color="#000080"
            hoverColor="#0000e0"
            label="↺"
            fontSize={0.8}
            onClick={() => gameApi.levelInitialize()}
          />
          <XrButton
            position={[-2, -5, -level.height / 2 - 8]}
            color="#800000"
            hoverColor="#e00000"
            fontSize={0.5}
            label="❌"
            onClick={() => gameApi.homeScreen()}
          />
          {completed && levelIndex < Levels.length - 1 && (
            <XrButton
              position={[2, -5, -level.height / 2 - 8]}
              color="#008000"
              hoverColor="#00e00"
              label="️→"
              onClick={() => gameApi.levelInitialize(levelIndex + 1)}
            />
          )}
        </>
      ) : (
        <PlayerCameraFollow debug={debug} />
      )}
      <group
        position={isVRMode ? [0, -3, -4] : undefined}
        scale={isVRMode ? 0.5 : undefined}
        rotation={isVRMode ? [0.2, 0, 0] : undefined}
      >
        <group position={[0, -level.width * 2, -level.width]}>
          <Stars />
        </group>
        <group position={[-level.width / 2, 0, -level.height / 2]}>
          <Player index={0} />
          <Player index={1} />
        </group>
        <LevelGeometry level={level} toggled={toggled} debug={debug} />
      </group>
    </>
  );
}
