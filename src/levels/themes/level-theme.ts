import { Color } from "three";

import { WallState } from "@/levels/level-schema";
import ThemeSpace from "@/levels/themes/theme-space";
import ThemeWar from "@/levels/themes/theme-war";

export enum LevelThemeId {
  SPACE = "space",
  WAR = "war",
}

export type LevelTheme = {
  wallColors: Record<number, Record<WallState, [Color, Color]>>;
  levelTiles: [Color, Color];
  trigger: {
    top: Color;
    in: Color;
    out: Color;
  };
};

export const THEMES: Record<LevelThemeId, LevelTheme> = {
  space: ThemeSpace,
  war: ThemeWar,
};

export const DEFAULT_LEVEL_THEME: LevelThemeId = LevelThemeId.SPACE;
