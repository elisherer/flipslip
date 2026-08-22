/** 0 = open (passable), 1 = regular wall, 2 = green toggle wall, 3 = purple toggle wall */
export type WallState = 0 | 1 | 2 | 3;

export const WALL_STATES: WallState[] = [0, 1, 2, 3];

/** 1 = trigger starts unpushed, 2 = trigger starts pushed. Absent/0/null = no trigger here. */
export type TriggerState = 1 | 2;

export interface Cell {
  /** Passability to the cell directly to the right (x + 1) */
  right: WallState;
  /** Passability to the cell directly below (y + 1) */
  down: WallState;
  /** Optional interactive trigger (toggle button) inside the cell */
  trigger?: TriggerState;
}

export interface LayerGrid {
  ground: (Cell | null)[][];
  air: (Cell | null)[][];
}

export interface PlayerStart {
  position: [x: number, y: number];
}

export interface Finish {
  position: [x: number, y: number];
}

export interface InitialToggleState {
  green: boolean;
  purple: boolean;
}

export interface Level {
  width: number;
  height: number;
  layers: LayerGrid;
  /** player 0 -> ground layer, player 1 -> air layer */
  players: [PlayerStart, PlayerStart];
  /** shared by both players/layers */
  finish: Finish;
  /** starting state of the green/purple toggle walls */
  initialState: InitialToggleState;
}

export type LayerName = keyof LayerGrid;

export const LAYER_NAMES: LayerName[] = ["ground", "air"];

export function createCell(): Cell {
  return { right: 0, down: 0 };
}

export function nextWallState(state: WallState): WallState {
  return WALL_STATES[(WALL_STATES.indexOf(state) + 1) % WALL_STATES.length];
}

/** Whether an edge with the given wall state currently lets a player pass through it. */
export function isWallStateOpen(state: WallState, toggled: boolean, initialState: InitialToggleState): boolean {
  switch (state) {
    case 0:
      return true;
    case 1:
      return false;
    case 2:
      return toggled === initialState.green;
    case 3:
      return toggled === initialState.purple;
  }
}

/**
 * All triggers share the single level-wide `toggled` bit. A trigger's current pushed
 * state is that bit XORed against its own starting state -- so flipping `toggled`
 * (which only happens by pushing a currently-unpushed trigger) inverts every trigger
 * in the level at once: whichever one you pushed becomes pushed, all others flip too.
 */
export function isTriggerPushed(trigger: TriggerState, toggled: boolean): boolean {
  return (trigger === 2) !== toggled;
}

export function nextTriggerState(trigger: TriggerState | undefined): TriggerState | undefined {
  if (trigger === undefined) return 1;
  if (trigger === 1) return 2;
  return undefined;
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
    initialState: { green: false, purple: false },
  };
}

function clampPosition([x, y]: [number, number], width: number, height: number): [number, number] {
  return [Math.min(x, width - 1), Math.min(y, height - 1)];
}

function resizeGrid(grid: (Cell | null)[][], width: number, height: number): (Cell | null)[][] {
  const next: (Cell | null)[][] = [];
  for (let y = 0; y < height; y++) {
    const row: (Cell | null)[] = [];
    for (let x = 0; x < width; x++) {
      row.push(grid[y]?.[x] ?? createCell());
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
    initialState: level.initialState,
  };
}

export function isValidLevel(value: any): value is Level {
  if (!value || typeof value !== "object") return false;
  if (typeof value.width !== "number" || typeof value.height !== "number") return false;
  if (!value.layers || typeof value.layers !== "object") return false;
  if (!LAYER_NAMES.every(name => Array.isArray(value.layers[name]))) return false;
  const isPosition = (p: any) => Array.isArray(p?.position) && p.position.length === 2;
  const isPositionPair = (arr: any) => Array.isArray(arr) && arr.length === 2 && arr.every(isPosition);
  if (!isPositionPair(value.players) || !isPosition(value.finish)) return false;
  return (
    typeof value.initialState?.green === "boolean" && typeof value.initialState?.purple === "boolean"
  );
}
