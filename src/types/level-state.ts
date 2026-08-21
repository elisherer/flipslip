import { Level } from "@/levels/level-schema";
import { Direction } from "@/types/direction";

export type LevelState = {
  level: Level;
  bag: Record<string, boolean>;
  toggled: boolean;
  completed: boolean;
  players: {
    prevPosition?: [x: number, y: number, z: number];
    position: [x: number, y: number, z: number];
    direction: Direction;
  }[];
};
