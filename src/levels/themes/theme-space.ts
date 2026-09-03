import { Color } from "three";

import { LevelTheme } from "@/levels/themes/level-theme";

const GREEN = new Color("#79c03d");
const GREEN_DARK = new Color("#406621");
const GREEN_MIDDLE = GREEN.clone().lerp(GREEN_DARK, 0.45);
const PURPLE = new Color("#863fc2");
const PURPLE_DARK = new Color("#472166");
const PURPLE_MIDDLE = PURPLE.clone().lerp(PURPLE_DARK, 0.45);

const WALL = new Color(0.8, 0.9, 1.4);
const WALL_DARK = new Color("#656471");
const WALL_MIDDLE = WALL.clone().lerp(WALL_DARK, 0.45);

const TILE_1 = new Color(0.33, 0.36, 0.54);
const TILE_2 = new Color(0.26, 0.28, 0.41);

// console.log(`new Color(${TILE_1.r.toFixed(2)},${TILE_1.g.toFixed(2)},${TILE_1.b.toFixed(2)});
// new Color(${TILE_2.r.toFixed(2)},${TILE_2.g.toFixed(2)},${TILE_2.b.toFixed(2)});`);

const TRIGGER_RING_TOP = new Color("#8090b0");
const TRIGGER_RING_IN = new Color("#405060");
const TRIGGER_RING_OUT = new Color("#8090b0");

const theme: LevelTheme = {
  wallColors: {
    0: {
      1: [WALL_DARK, WALL_MIDDLE],
      2: [GREEN_DARK, GREEN_MIDDLE],
      3: [GREEN_DARK, GREEN_MIDDLE],
      4: [PURPLE_DARK, PURPLE_MIDDLE],
      5: [PURPLE_DARK, PURPLE_MIDDLE],
    },
    1: {
      1: [WALL_DARK, WALL],
      2: [GREEN_DARK, GREEN],
      3: [GREEN_DARK, GREEN],
      4: [PURPLE_DARK, PURPLE],
      5: [PURPLE_DARK, PURPLE],
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
