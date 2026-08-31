import { Grid } from "@react-three/drei";
import { useMemo } from "react";

import { LAYER_NAMES, Level, isSwitchTrigger, isTriggerPushed, isWallStateOpen } from "@/levels/level-schema";
import { rot } from "@/utils/constants";

import KitModel from "../components/kit-model";

const WALL_COLORS: Record<number, string> = {
  1: "white",
  2: "#79c03d",
  3: "#79c03d",
  4: "#863fc2",
  5: "#863fc2",
};

/**
 * Pure level geometry (floors/walls/triggers/finish + optional debug grid), driven only by
 * `level`/`toggled` -- no players, sounds, or camera. Shared by the in-game `LevelRenderer`
 * and the level editor's live 3D preview.
 */
export default function LevelGeometry({
  level,
  toggled,
  debug,
  preview,
}: {
  level: Level;
  toggled: boolean;
  debug?: boolean;
  /** Render static player models at their level-defined start positions (for the level editor's live preview). */
  preview?: boolean;
}) {
  const blocks = useMemo(() => {
    const a: any[] = [];
    const [finishX, finishZ] = level.finish.position;

    for (let z = 0; z < level.height; z++) {
      for (let x = 0; x < level.width; x++) {
        const key = x + "," + z + "/" + toggled;
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

        LAYER_NAMES.forEach((layerName, l) => {
          const cell = level.layers[layerName][z]?.[x];
          if (!cell) return;
          // key should contain trigger so it will invalidate the model on the level editor when edited
          const layerKey = l + ":" + key + (cell.trigger ? "/" + cell.trigger : "");
          if (cell.trigger) {
            const isSwitch = isSwitchTrigger(cell.trigger);
            const pushed = isTriggerPushed(cell.trigger, toggled);
            objects.push(
              <KitModel
                key={layerKey}
                position={[0, l * 0.5 - 1, 0]}
                kit="prototype"
                model="button-floor-square-small"
                variant={isSwitch ? "p" : "t"}
                animate={pushed ? "toggle-on" : "toggle-off"}
                receiveShadow
                castShadow
              />,
            );
          }
          let isFinish = x === finishX && z === finishZ;
          if (layerName === "ground" && isFinish) {
            objects.push(
              <KitModel
                key={layerKey + ":finish"}
                position={[0, -0.99, 0]}
                scale={0.75}
                kit="prototype"
                model="indicator-special-lines"
                receiveShadow
              />,
            );
            objects.push(
              <KitModel
                key={layerKey + ":finish/flag"}
                position={[0, -0.99, 0]}
                rotation={rot.y90}
                scale={0.5}
                kit="prototype"
                model="flag"
                receiveShadow
              />,
            );
          }
          const neighborRight = level.layers[layerName][z]?.[x + 1];
          if (cell.right || !neighborRight) {
            if (cell.right > 1) {
              const open = isWallStateOpen(neighborRight ? cell.right : 1, toggled);
              objects.push(
                <mesh key={layerKey + ":right"} position={[0.5, l * 0.5 - 0.75, 0]} rotation={rot.y270}>
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
                  rotation={l === 0 ? rot.x180 : undefined}
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
            const cellBelow = layerName === "air" ? level.layers.ground[z]?.[x] : null;
            if (cell.down > 1) {
              const open = isWallStateOpen(neighborBelow ? cell.down : 1, toggled);
              objects.push(
                <mesh key={layerKey + ":down"} position={[0, l * 0.5 - 0.75, 0.5]}>
                  <boxGeometry args={[0.9, 0.5, 0.1]} />
                  <meshStandardMaterial
                    polygonOffset
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                    color={WALL_COLORS[neighborBelow ? cell.down : 1]}
                    transparent
                    opacity={
                      open ? 0.4 : z < level.height - 1 && (cell.trigger || cellBelow?.trigger || isFinish) ? 0.8 : 1
                    }
                  />
                </mesh>,
              );
            } else {
              objects.push(
                <KitModel
                  key={layerKey + ":down"}
                  position={[0, -0.5, 0.5]}
                  rotation={l === 0 ? [Math.PI, Math.PI / 2, 0] : rot.y90}
                  opacity={z < level.height - 1 && (cell.trigger || cellBelow?.trigger || isFinish) ? 0.4 : 1}
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
                rotation={l === 0 ? rot.z180 : undefined}
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
                rotation={l === 0 ? [Math.PI, Math.PI / 2, 0] : rot.y90}
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
      <group position={[-level.width / 2, 0, -level.height / 2]}>
        {blocks}
        {preview && (
          <>
            <group position={[level.players[0].position[0], 0, level.players[0].position[1]]}>
              <KitModel kit="characters" model="Astronaut.gltf" scale={0.72} position={[0, -1, 0]} />
            </group>
            <group position={[level.players[1].position[0], 0, level.players[1].position[1]]}>
              <KitModel
                receiveShadow={false}
                kit="td"
                model="enemy-ufo-a"
                variant="a"
                scale={[0.67, 0.4, 0.67]}
                position={[0, -0.3, 0]}
              />
            </group>
          </>
        )}
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
