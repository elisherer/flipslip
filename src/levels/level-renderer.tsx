import { Grid } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import useSound from "use-sound";

import { Music, Sounds } from "@/assets/sounds";
import Portal from "@/components/portal";
import Stars from "@/components/starts";
import { LAYER_NAMES, isWallStateOpen } from "@/levels/level-schema";
import Player from "@/levels/player";
import useCameraFollowPlayers from "@/levels/use-camera-follow-players";
import { useGameState } from "@/providers/game-state-provider";
import { useLevelState } from "@/providers/level-state-provider";

import KitModel from "../components/kit-model";
import useBackgroundMusic from "../hooks/use-background-music";

type LevelProps = {
  debug?: boolean;
  onFinishLevel: () => void;
};

// TODO(phase 2): proper wall rendering (colored walls, hidden-when-no-neighbor). This is
// a debug-only stand-in so wall passability can be visually verified in the meantime.
const WALL_DEBUG_COLOR: Record<number, string> = {
  1: "white",
  2: "#79c03d",
  3: "#d40de9",
};

export default function LevelRenderer({ onFinishLevel }: LevelProps) {
  useBackgroundMusic(Music.LEVEL1);
  const [{ debug }] = useGameState();
  const [{ level, toggled, completed }] = useLevelState();
  const [playClick] = useSound(Sounds.CLICK);
  const [playUnclick] = useSound(Sounds.UNCLICK);

  useCameraFollowPlayers(debug);

  useEffect(() => {
    toggled ? playClick() : playUnclick();
  }, [toggled]);

  useEffect(() => {
    if (completed) onFinishLevel();
  }, [completed]);

  const blocks = useMemo(() => {
    const a: any[] = [];
    const [finishX, finishZ] = level.finish.position;

    for (let z = 0; z < level.height; z++) {
      for (let x = 0; x < level.width; x++) {
        const key = x + "," + z;
        const objects = [];

        if (level.layers.ground[z]?.[x] || level.layers.air[z]?.[x]) {
          objects.push(
            <KitModel
              key={key + ":floor"}
              position={[0, level.layers.ground[z]?.[x] ? -1.01 : -0.51, 0]}
              kit="prototype"
              model="floor-square"
              receiveShadow
              castShadow
            />,
          );
        }

        LAYER_NAMES.forEach((layerName, i) => {
          const cell = level.layers[layerName][z]?.[x];
          if (!cell) return;
          const layerKey = i + ":" + key;

          if (cell.trigger) {
            objects.push(
              <KitModel
                key={layerKey}
                position={[0, i * 0.5 - 1, 0]}
                kit="prototype"
                model="button-floor-square"
                animate={toggled ? "toggle-on" : "toggle-off"}
                receiveShadow
                castShadow
              />,
            );
          }
          if (layerName === "ground" && x === finishX && z === finishZ) {
            objects.push(<Portal key={layerKey + ":finish"} position={[0, -0.99, 0]} />);
          }
          const neighborRight = level.layers[layerName][z]?.[x + 1];
          if (cell.right !== 0 || !neighborRight) {
            const open = isWallStateOpen(neighborRight ? cell.right : 1, toggled, level.initialState);
            objects.push(
              <mesh key={layerKey + ":right"} position={[0.5, i * 0.5 - 0.75, 0]}>
                <boxGeometry args={[0.1, 0.5, 1.0]} />
                <meshStandardMaterial color={WALL_DEBUG_COLOR[cell.right]} transparent opacity={open ? 0.4 : 1} />
              </mesh>,
            );
          }
          const neighborBelow = level.layers[layerName][z + 1]?.[x];
          if (cell.down !== 0 || !neighborBelow) {
            const open = isWallStateOpen(neighborBelow ? cell.down : 1, toggled, level.initialState);
            objects.push(
              <mesh key={layerKey + ":down"} position={[0, i * 0.5 - 0.75, 0.5]}>
                <boxGeometry args={[1.0, 0.5, 0.1]} />
                <meshStandardMaterial color={WALL_DEBUG_COLOR[cell.down]} transparent opacity={open ? 0.4 : 1} />
              </mesh>,
            );
          }
          const neighborLeft = level.layers[layerName][z]?.[x - 1];
          if (!neighborLeft) {
            objects.push(
              <mesh key={layerKey + ":left"} position={[-0.5, i * 0.5 - 0.75, 0]}>
                <boxGeometry args={[0.1, 0.5, 1.0]} />
                <meshStandardMaterial color={WALL_DEBUG_COLOR[1]} />
              </mesh>,
            );
          }
          const neighborAbove = level.layers[layerName][z - 1]?.[x];
          if (!neighborAbove) {
            objects.push(
              <mesh key={layerKey + ":up"} position={[0, i * 0.5 - 0.75, -0.5]}>
                <boxGeometry args={[1.0, 0.5, 0.1]} />
                <meshStandardMaterial color={WALL_DEBUG_COLOR[1]} />
              </mesh>,
            );
          }
        });

        a.push(
          <group key={key} position={[x, 0, z]}>
            {objects}
          </group>,
        );
      }
    }
    return a;
  }, [level, toggled, debug]);

  return (
    <>
      <group position={[0, -level.width * 2, -level.width]}>
        <Stars />
      </group>
      <group position={[-level.width / 2, 0, -level.height / 2]}>
        <Player index={0} />
        <Player index={1} />
        {blocks}
      </group>
      {debug && (
        <Grid
          args={[level.width % 2 ? level.width + 1 : level.width, level.height % 2 ? level.height + 1 : level.height]}
          sectionColor="black"
          cellSize={1}
          position={[-0.5 + (level.width % 2 ? 0.5 : 0), 0.01 - 1, -0.5 + (level.height % 2 ? 0.5 : 0)]}
        />
      )}
    </>
  );
}
