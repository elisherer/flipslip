import { LevelThemeId } from "@/levels/themes/level-theme";

/**
 * 1 = regular wall,
 * 2 = green toggle wall starting open, 3 = green toggle wall starting closed,
 * 4 = purple toggle wall starting open, 5 = purple toggle wall starting closed.
 */
export type WallState = 1 | 2 | 3 | 4 | 5;

/**
 * 1 = toggle trigger starts unpushed, 2 = toggle trigger starts pushed. 3/4 = switch trigger
 * starts unpushed/pushed -- same shared `toggled` bit as toggle triggers (see
 * isTriggerPushed), but additionally swaps the ground/air players' positions the moment it
 * transitions to pushed (see isSwitchTrigger, arriveAt). Absent/0/null = no trigger here.
 */
export type TriggerState = 1 | 2 | 3 | 4;

export interface Cell {
  /** Passability to the cell directly to the right (x + 1) */
  right?: WallState;
  /** Passability to the cell directly below (y + 1) */
  down?: WallState;
  /** Optional interactive trigger (toggle button) inside the cell */
  trigger?: TriggerState;
}

export interface LayerGrid {
  ground: (Cell | null)[][];
  air: (Cell | null)[][];
}

export interface PlayerStart {
  position: [x: number, z: number];
}

export interface Finish {
  position: [x: number, z: number];
}

export interface Level {
  width: number;
  height: number;
  theme?: LevelThemeId;
  layers: LayerGrid;
  /** player 0 -> ground layer, player 1 -> air layer */
  players: [PlayerStart, PlayerStart];
  /** shared by both players/layers */
  finish: Finish;
}

export type LayerName = keyof LayerGrid;

export const LAYER_NAMES: LayerName[] = ["ground", "air"];
export const LAYER_NAMES_REVERSED: LayerName[] = ["air", "ground"];

export function createCell(): Cell {
  return {};
}

/** Whether an edge with the given wall state currently lets a player pass through it. */
export function isWallStateOpen(state: WallState | undefined, toggled: boolean): boolean {
  if (!state) return true;
  switch (state) {
    case 1:
      return false;
    default:
      // 2/4 start open, 3/5 start closed -- each wall carries its own starting state
      return (state === 2 || state === 4) !== toggled;
  }
}

/** Whether a trigger is a "switch" trigger (swaps players) rather than a toggle trigger. */
export function isSwitchTrigger(trigger: TriggerState): boolean {
  return trigger === 3 || trigger === 4;
}

/** The trigger's own starting pushed state, independent of its kind. */
export function triggerStartsPushed(trigger: TriggerState): boolean {
  return trigger === 2 || trigger === 4;
}

/**
 * All triggers (toggle and switch alike) share the single level-wide `toggled` bit. A
 * trigger's current pushed state is that bit XORed against its own starting state -- so
 * flipping `toggled` (which only happens by pushing a currently-unpushed trigger) inverts
 * every trigger in the level at once: whichever one you pushed becomes pushed, all others
 * flip too. Switch triggers additionally swap the players on that same transition -- see
 * `arriveAt` in level-state-provider.tsx.
 */
export function isTriggerPushed(trigger: TriggerState, toggled: boolean): boolean {
  return triggerStartsPushed(trigger) !== toggled;
}

export function nextTriggerState(trigger: TriggerState | undefined): TriggerState | undefined {
  if (trigger === undefined) return 1;
  if (trigger === 4) return undefined;
  return (trigger + 1) as TriggerState;
}

export function prevTriggerState(trigger: TriggerState | undefined): TriggerState | undefined {
  if (trigger === undefined) return 4;
  if (trigger === 1) return undefined;
  return (trigger - 1) as TriggerState;
}

export function createGrid(width: number, height: number): (Cell | null)[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => createCell()));
}

export function createLevel(width: number, height: number): Level {
  return {
    width,
    height,
    layers: {
      ground: createGrid(width, height),
      air: createGrid(width, height),
    },
    players: [{ position: [0, 0] }, { position: [0, 0] }],
    finish: { position: [0, 0] },
  };
}

function clampPosition([x, y]: [number, number], width: number, height: number): [number, number] {
  return [Math.min(x, width - 1), Math.min(y, height - 1)];
}

function resizeGrid(grid: (Cell | null)[][], width: number, height: number): (Cell | null)[][] {
  const oldHeight = grid.length;
  const oldWidth = grid[0]?.length ?? 0;
  const next: (Cell | null)[][] = [];
  for (let y = 0; y < height; y++) {
    const row: (Cell | null)[] = [];
    for (let x = 0; x < width; x++) {
      row.push(y < oldHeight && x < oldWidth ? grid[y][x] : createCell());
    }
    next.push(row);
  }
  return next;
}

export function resizeLevel(level: Level, width: number, height: number): Level {
  return {
    width,
    height,
    layers: {
      ground: resizeGrid(level.layers.ground, width, height),
      air: resizeGrid(level.layers.air, width, height),
    },
    players: [
      { position: clampPosition(level.players[0].position, width, height) },
      { position: clampPosition(level.players[1].position, width, height) },
    ],
    finish: { position: clampPosition(level.finish.position, width, height) },
  };
}

export function isValidLevel(value: any): value is Level {
  if (!value || typeof value !== "object") return false;
  if (typeof value.width !== "number" || typeof value.height !== "number") return false;
  if (!value.layers || typeof value.layers !== "object") return false;
  if (!LAYER_NAMES.every(name => Array.isArray(value.layers[name]))) return false;
  const isPosition = (p: any) => Array.isArray(p?.position) && p.position.length === 2;
  const isPositionPair = (arr: any) => Array.isArray(arr) && arr.length === 2 && arr.every(isPosition);
  return isPositionPair(value.players) && isPosition(value.finish);
}
