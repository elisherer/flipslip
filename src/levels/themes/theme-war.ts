import { Color } from "three";

import { WallState } from "@/levels/level-schema";
import { LevelTheme } from "@/levels/themes/level-theme";

const GREEN = new Color("#79c03d");
const GREEN_DARK = new Color("#406621");
const GREEN_MIDDLE = GREEN.clone().lerp(GREEN_DARK, 0.45);
const PURPLE = new Color("#863fc2");
const PURPLE_DARK = new Color("#472166");
//const PURPLE_MIDDLE = PURPLE.clone().lerp(PURPLE_DARK, 0.45);

const WALL = new Color(1.3, 0.9, 0.6);
const WALL_DARK = new Color("#7c5d44");
const WALL_MIDDLE = WALL.clone().lerp(WALL_DARK, 0.45);

const TILE_1 = new Color("#885019");
const TILE_2 = new Color("#754412");

const TRIGGER_RING_TOP = new Color("#805040");
const TRIGGER_RING_IN = new Color("#604020");
const TRIGGER_RING_OUT = new Color("#805040");

const theme: LevelTheme = {
  wallColors: {
    0: {
      [WallState.REGULAR]: [WALL_DARK, WALL_MIDDLE],
      [WallState.START_OPEN]: [GREEN_DARK, GREEN_MIDDLE],
      [WallState.START_CLOSED]: [GREEN_DARK, GREEN_MIDDLE],
    },
    1: {
      [WallState.REGULAR]: [WALL_DARK, WALL],
      [WallState.START_OPEN]: [PURPLE_DARK, PURPLE],
      [WallState.START_CLOSED]: [PURPLE_DARK, PURPLE],
    },
  },
  levelTiles: [TILE_1, TILE_2],
  trigger: {
    top: TRIGGER_RING_TOP,
    in: TRIGGER_RING_IN,
    out: TRIGGER_RING_OUT,
  },
};

export default theme;
