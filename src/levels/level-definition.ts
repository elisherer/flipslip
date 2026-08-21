import { KitModelSpec } from "@/assets/kit";

export enum CellType {
  EMPTY,
  WALL,
  TOGGLE,
  TOGGLE_WALL,
  FINISH,
}

export enum ToggleId {
  PURPLE = "PURPLE",
  GREEN = "GREEN",
}

export type Cell = {
  texture?: string;
} & (
  | {
      type: CellType.EMPTY;
    }
  | {
      type: CellType.WALL;
    }
  | {
      type: CellType.TOGGLE;
    }
  | {
      type: CellType.TOGGLE_WALL;
      toggle_id: ToggleId;
    }
  | {
      type: CellType.FINISH;
    }
);

export type Tile = KitModelSpec & {
  correction?: {
    position?: [x: number, y: number, z: number];
    rotation?: [x: number, y: number, z: number];
    scale?: number | [x: number, y: number, z: number];
  };
  rotation?: [x: number, y: number, z: number];
  scale?: number | [x: number, y: number, z: number];
};

export type LevelDefinition = {
  width: number;
  height: number;
  layers: Cell[][][];
  tiles: (Tile | Tile[])[][][];
  initialState: Partial<Record<ToggleId, boolean>>;
  players: {
    position: [x: number, y: number, z: number];
  }[];
};
