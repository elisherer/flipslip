import { Grid } from "@react-three/drei";
import { useMemo } from "react";

import LevelFloor from "@/levels/level-floor";
import { LAYER_NAMES, Level, isWallStateOpen } from "@/levels/level-schema";
import LevelTrigger from "@/levels/level-trigger";
import LevelTutorials from "@/levels/level-tutorials";
import LevelWall from "@/levels/level-wall";
import { rot } from "@/utils/constants";

import KitModel from "../components/kit-model";

const GROUND_HEIGHT = 0.4;
const AIR_HEIGHT = 0.25;

const renderBlocks = (level: Level, toggled: boolean) => {
  const a: any[] = [];
  const [finishX, finishZ] = level.finish.position;

  for (let z = 0; z < level.height; z++) {
    for (let x = 0; x < level.width; x++) {
      const key = x + "," + z + "/" + toggled;
      const objects = [];
      if (level.layers.ground[z]?.[x] || level.layers.air[z]?.[x]) {
        const idx = level.layers.ground[z]?.[x] ? 0 : 1;
        objects.push(
          <LevelFloor
            key={key + ":floor"}
            theme={level.theme}
            layerIndex={idx}
            position={[0, idx === 0 ? 0 : GROUND_HEIGHT - 0.001, 0]}
          />,
        );
      }

      LAYER_NAMES.forEach((layerName, l) => {
        const cell = level.layers[layerName][z]?.[x];
        if (!cell) return;
        const layerHeight = l === 0 ? GROUND_HEIGHT : AIR_HEIGHT;
        // key should contain trigger so it will invalidate the model on the level editor when edited
        const layerKey = l + ":" + key + (cell.trigger ? "/" + cell.trigger : "");
        if (cell.trigger) {
          objects.push(
            <LevelTrigger
              key={layerKey}
              position={[0, l * GROUND_HEIGHT + 0.01, 0]}
              theme={level.theme}
              state={cell.trigger}
              toggled={toggled}
              floating={Boolean(level.layers.ground[z]?.[x]) && l === 1}
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
              position={[0, 0.01, 0]}
              scale={0.75}
              kit="prototype"
              model="indicator-special-lines"
              receiveShadow
            />,
          );
          objects.push(
            <KitModel
              key={layerKey + ":finish/flag"}
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
          if ((cell.right ?? 0) > 1 && neighborRight) {
            const open = isWallStateOpen(cell.right, toggled);
            objects.push(
              <LevelWall
                key={layerKey + ":right"}
                position={[0.5, l * GROUND_HEIGHT + layerHeight / 2, 0]}
                rotation={rot.y90}
                boxArgs={[0.9, layerHeight, 0.1]}
                state={cell.right}
                opacity={open ? 0.5 : 1}
                layerIndex={l}
                theme={level.theme}
              />,
            );
          } else {
            objects.push(
              <LevelWall
                key={layerKey + ":right"}
                position={[0.5, l * GROUND_HEIGHT + layerHeight / 2, 0]}
                rotation={rot.y90}
                boxArgs={[1.1, layerHeight, 0.1]}
                layerIndex={l}
                theme={level.theme}
              />,
            );
          }
        }
        const neighborDown = level.layers[layerName][z + 1]?.[x];
        if (cell.down || !neighborDown) {
          const cellBelow = layerName === "air" ? level.layers.ground[z]?.[x] : null;
          if ((cell.down ?? 0) > 1 && neighborDown) {
            const open = isWallStateOpen(cell.down, toggled);
            objects.push(
              <LevelWall
                key={layerKey + ":down"}
                position={[0, l * GROUND_HEIGHT + layerHeight / 2, 0.5]}
                boxArgs={[0.9, layerHeight, 0.1]}
                state={cell.down}
                opacity={
                  open ? 0.5 : z < level.height - 1 && (cell.trigger || cellBelow?.trigger || isFinish) ? 0.8 : 1
                }
                layerIndex={l}
                theme={level.theme}
              />,
            );
          } else {
            objects.push(
              <LevelWall
                key={layerKey + ":down"}
                position={[0, l * GROUND_HEIGHT + layerHeight / 2, 0.5]}
                boxArgs={[1.1, layerHeight, 0.1]}
                opacity={z < level.height - 1 && (cell.trigger || cellBelow?.trigger || isFinish) ? 0.6 : 1}
                layerIndex={l}
                theme={level.theme}
              />,
            );
          }
        }
        const neighborLeft = level.layers[layerName][z]?.[x - 1];
        if (!neighborLeft) {
          objects.push(
            <LevelWall
              key={layerKey + ":left"}
              position={[-0.5, l * GROUND_HEIGHT + layerHeight / 2, 0]}
              rotation={rot.y90}
              boxArgs={[1.1, layerHeight, 0.1]}
              layerIndex={l}
              theme={level.theme}
            />,
          );
        }
        const neighborUp = level.layers[layerName][z - 1]?.[x];
        if (!neighborUp) {
          objects.push(
            <LevelWall
              key={layerKey + ":up"}
              position={[0, l * GROUND_HEIGHT + layerHeight / 2, -0.5]}
              boxArgs={[1.1, layerHeight, 0.1]}
              layerIndex={l}
              theme={level.theme}
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
  const blocks = useMemo(() => [renderBlocks(level, false), renderBlocks(level, true)], [level]);

  return (
    <>
      <group position={[-level.width / 2, 0, -level.height / 2]}>
        {blocks[toggled ? 1 : 0]}
        {preview && (
          <>
            <group position={[level.players[0].position[0], 0, level.players[0].position[1]]}>
              <KitModel kit="characters" model="Astronaut.gltf" scale={0.66} />
            </group>
            <group position={[level.players[1].position[0], 0, level.players[1].position[1]]}>
              <KitModel
                receiveShadow={false}
                kit="td"
                model="enemy-ufo-a"
                variant="a"
                scale={[0.67, 0.4, 0.67]}
                position={[0, 0.5, 0]}
              />
            </group>
          </>
        )}
        <LevelTutorials level={level} />
      </group>
      {debug && (
        <Grid
          args={[level.width % 2 ? level.width + 1 : level.width, level.height % 2 ? level.height + 1 : level.height]}
          sectionColor="black"
          cellSize={1}
          position={[-0.5 + (level.width % 2 ? 0.5 : 0), 0.001, -0.5 + (level.height % 2 ? 0.5 : 0)]}
        />
      )}
    </>
  );
}
