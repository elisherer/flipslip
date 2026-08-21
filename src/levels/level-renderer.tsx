import { Grid } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import useSound from "use-sound";

import { Music, Sounds } from "@/assets/sounds";
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

const WALL_COLORS: Record<number, string> = {
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
                model="button-floor-square-small"
                animate={toggled ? "toggle-on" : "toggle-off"}
                receiveShadow
                castShadow
              />,
            );
          }
          if (layerName === "ground" && x === finishX && z === finishZ) {
            objects.push(
              //
              //<Portal key={layerKey + ":finish"} position={[0, -0.99, 0]} />
              <KitModel
                key={layerKey + ":finish"}
                position={[0, -0.99, 0]}
                scale={0.5}
                kit="prototype"
                model="indicator-special-lines"
                receiveShadow
              />,
            );
          }
          const neighborRight = level.layers[layerName][z]?.[x + 1];
          if (cell.right || !neighborRight) {
            if (cell.right > 1) {
              const open = isWallStateOpen(neighborRight ? cell.right : 1, toggled, level.initialState);
              objects.push(
                <mesh key={layerKey + ":right"} position={[0.5, i * 0.5 - 0.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
                  <boxGeometry args={[0.9, 0.5, 0.1]} />
                  <meshStandardMaterial
                    polygonOffset
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                    color={WALL_COLORS[neighborRight ? cell.right : 1]}
                    transparent
                    opacity={open ? 0.4 : 1}
                  />
                </mesh>,
              );
            } else {
              objects.push(
                <KitModel
                  key={layerKey + ":right"}
                  position={[0.5, -0.5, 0]}
                  rotation={i === 0 ? [Math.PI, 0, 0] : undefined}
                  scale={[0.5, 1, 1.1]}
                  kit="prototype"
                  model="wall-low"
                  receiveShadow
                  castShadow
                />,
              );
            }
          }
          const neighborBelow = level.layers[layerName][z + 1]?.[x];
          if (cell.down || !neighborBelow) {
            const transparency = 1 - (z / (level.height - 1)) * 0.45;
            if (cell.down > 1) {
              const open = isWallStateOpen(neighborBelow ? cell.down : 1, toggled, level.initialState);
              objects.push(
                <mesh key={layerKey + ":down"} position={[0, i * 0.5 - 0.75, 0.5]}>
                  <boxGeometry args={[0.9, 0.5, 0.1]} />
                  <meshStandardMaterial
                    polygonOffset
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                    color={WALL_COLORS[neighborBelow ? cell.down : 1]}
                    transparent
                    opacity={open ? 0.4 : neighborBelow || cell.down > 1 ? 1 : transparency}
                  />
                </mesh>,
              );
            } else {
              objects.push(
                <KitModel
                  key={layerKey + ":down"}
                  position={[0, -0.5, 0.5]}
                  rotation={[i === 0 ? Math.PI : 0, Math.PI / 2, 0]}
                  // the closer it is the more transparent it is
                  opacity={transparency}
                  scale={[0.5, 1, 1.1]}
                  kit="prototype"
                  model="wall-low"
                  receiveShadow
                  castShadow
                />,
              );
            }
          }
          const neighborLeft = level.layers[layerName][z]?.[x - 1];
          if (!neighborLeft) {
            objects.push(
              <KitModel
                key={layerKey + ":left"}
                position={[-0.5, -0.5, 0]}
                rotation={i === 0 ? [0, 0, Math.PI] : undefined}
                scale={[0.5, 1, 1.1]}
                kit="prototype"
                model="wall-low"
                receiveShadow
                castShadow
              />,
            );
          }
          const neighborAbove = level.layers[layerName][z - 1]?.[x];
          if (!neighborAbove) {
            objects.push(
              <KitModel
                key={layerKey + ":up"}
                position={[0, -0.5, -0.5]}
                rotation={[i === 0 ? Math.PI : 0, Math.PI / 2, 0]}
                scale={[0.5, 1, 1.1]}
                kit="prototype"
                model="wall-low"
                receiveShadow
                castShadow
              />,
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
