import { Grid } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import useSound from "use-sound";

import { Music, Sounds } from "@/assets/sounds";
import Portal from "@/components/portal";
import { CellType, ToggleId } from "@/levels/level-definition";
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

export default function LevelRenderer({ onFinishLevel: _ }: LevelProps) {
  useBackgroundMusic(Music.LEVEL1);
  const [{ debug }] = useGameState();
  const [{ level, toggled }] = useLevelState();
  const [playClick] = useSound(Sounds.CLICK);
  const [playUnclick] = useSound(Sounds.UNCLICK);

  useCameraFollowPlayers(debug);

  useEffect(() => {
    toggled ? playClick() : playUnclick();
  }, [toggled]);

  const blocks = useMemo(() => {
    const a: any[] = [];
    for (let z = 0; z < level.height; z++) {
      for (let x = 0; x < level.width; x++) {
        const key = x + "," + z;
        // if (x < 0 || x >= level.width || z < 0 || z >= level.height) {
        //   a.push(
        //     <group key={key} position={[x, -1, z]}>
        //       <KitModel kit="block-bits" model="water" scale={0.5} receiveShadow castShadow />
        //     </group>,
        //   );
        //   continue;
        // }
        const objects = [];

        for (let i = 0; i < level.layers.length; i++) {
          const layerKey = i + ":" + key;

          const cell = level.layers[i][z][x];
          if (cell.type === CellType.WALL && debug) {
            objects.push(
              <mesh key={layerKey} position={[0, i * 0.5 - 0.75, 0]}>
                <boxGeometry args={[1, 0.5, 1]} />
                <meshStandardMaterial color="white" wireframe={true} />
              </mesh>,
            );
          } else if (cell.type === CellType.TOGGLE_WALL && debug) {
            objects.push(
              <mesh key={layerKey} position={[0, i * 0.5 - 0.75, 0]}>
                <boxGeometry args={[1, 0.5, 1]} />
                <meshStandardMaterial color={cell.toggle_id === ToggleId.BLUE ? "blue" : "red"} wireframe={true} />
              </mesh>,
            );
          } else if (cell.type === CellType.TOGGLE) {
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
          } else if (cell.type === CellType.FINISH && i === 0) {
            objects.push(<Portal position={[0, -0.99, 0]} />);
          }

          const tilesC = level.tiles[i][z][x];
          const tiles = Array.isArray(tilesC) ? tilesC : [tilesC];
          const coloring =
            cell.type === CellType.TOGGLE_WALL
              ? {
                  color: cell.toggle_id === ToggleId.BLUE ? "blue" : "red",
                  opacity: toggled !== level.initialState[cell.toggle_id] ? 1 : 0.4,
                }
              : undefined;

          tiles.forEach(({ correction, rotation, scale, ...tile }, ti) =>
            objects.push(
              correction ? (
                <group key={layerKey + ":" + ti} position={[0, -1, 0]} scale={scale} rotation={rotation}>
                  <KitModel {...correction} {...coloring} {...tile} receiveShadow castShadow />
                </group>
              ) : (
                <KitModel
                  key={layerKey + ":" + ti}
                  position={[0, i * 0.5 - 1, 0]}
                  scale={scale}
                  rotation={rotation}
                  {...tile}
                  {...coloring}
                  receiveShadow
                  castShadow
                />
              ),
            ),
          );
        }

        a.push(
          <group key={key} position={[x, 0, z]}>
            {objects}
            <KitModel position={[0, -1.01, 0]} kit="prototype" model="floor-square" receiveShadow castShadow />
          </group>,
        );
      }
    }
    return a;
  }, [level.layers, toggled, debug]);

  return (
    <>
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
