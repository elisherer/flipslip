import { ComponentProps } from "react";

import { LevelThemeId, THEMES } from "@/levels/themes/level-theme";
import { rot } from "@/utils/constants";

const AMOUNT = 2;
const STEP = 1 / AMOUNT / 2;

export default function LevelFloor({
  theme = LevelThemeId.SPACE,
  layerIndex,
  ...props
}: {
  theme?: LevelThemeId;
  layerIndex: number;
} & ComponentProps<"group">) {
  const tiles = THEMES[theme ?? LevelThemeId.SPACE].levelTiles;
  return (
    <group rotation={rot.x270} {...props}>
      <mesh receiveShadow position={[-STEP, -STEP, 0]}>
        <planeGeometry args={[0.5, 0.5, 1, 1]} />
        <meshStandardMaterial color={tiles[0]} />
      </mesh>
      <mesh receiveShadow position={[STEP, -STEP, 0]}>
        <planeGeometry args={[0.5, 0.5, 1, 1]} />
        <meshStandardMaterial color={tiles[1]} />
      </mesh>
      <mesh receiveShadow position={[-STEP, STEP, 0]}>
        <planeGeometry args={[0.5, 0.5, 1, 1]} />
        <meshStandardMaterial color={tiles[1]} />
      </mesh>
      <mesh receiveShadow position={[STEP, STEP, 0]}>
        <planeGeometry args={[0.5, 0.5, 1, 1]} />
        <meshStandardMaterial color={tiles[0]} />
      </mesh>
    </group>
  );
}
