import { KitModelSpec } from "@/assets/kit";
import { ProgressState } from "@/types/progress-state";

export type Settings = {
  sfx: boolean;
  music: boolean;
  hq: boolean;
};
export type GameState = {
  windowHasFocus: boolean;
  audioLocked: boolean;
  debug: boolean;
  settings: Settings;
  inLevel: boolean;
  levelIndex: number;
  invalidationFlag: number;
  character: KitModelSpec;
  progress: ProgressState;
};
