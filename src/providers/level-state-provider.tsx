import { KeyboardControls } from "@react-three/drei";
import { PropsWithChildren, useContext, useEffect } from "react";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";
import useSound from "use-sound";

import { Sounds } from "@/assets/sounds";
import { Level, LayerName, isWallStateOpen } from "@/levels/level-schema";
import { Levels } from "@/levels/levels";
import { useGameState } from "@/providers/game-state-provider";
import { KEYBOARD_MAP } from "@/providers/keyboard-map";
import { Direction } from "@/types/direction";
import { LevelState } from "@/types/level-state";

const LAYER_FOR_PLAYER: LayerName[] = ["ground", "air"];

const EMPTY_STATE: LevelState = {
  level: Levels[0],
  bag: {},
  toggled: false,
  completed: false,
  players: [
    {
      position: [0, 0, 0],
      direction: Direction.DOWN,
    },
    {
      position: [0, 0, 0],
      direction: Direction.DOWN,
    },
  ],
};

export const initialState = EMPTY_STATE;

export function canEnterCell(
  level: Level | undefined,
  player: number,
  toggled: boolean,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  if (!level) return true;
  const grid = level.layers[LAYER_FOR_PLAYER[player]];
  const fromCell = grid[fromZ]?.[fromX];
  const toCell = grid[toZ]?.[toX];
  if (!fromCell || !toCell) return false;

  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const edgeState = dx === 1 ? fromCell.right : dx === -1 ? toCell.right : dz === 1 ? fromCell.down : toCell.down;

  return isWallStateOpen(edgeState, toggled, level.initialState);
}

const actions = {
  initialize: (draft: LevelState, level?: Level) => {
    draft.level = level ?? draft.level;
    draft.toggled = false;
    draft.completed = false;
    draft.bag = {};
    if (draft.level) {
      draft.players = draft.level.players.map(p => ({
        position: [p.position[0], 0, p.position[1]],
        direction: Direction.DOWN,
      }));
    }
  },
  moveTo: (draft: LevelState, player: number, position: [x: number, y: number, z: number]) => {
    const { level } = draft;
    if (!level) return;
    const [x, , z] = position;
    const [px, , pz] = draft.players[player].position;

    if (!canEnterCell(level, player, draft.toggled, px, pz, x, z)) return;

    if (x < px) draft.players[player].direction = Direction.LEFT;
    else if (x > px) draft.players[player].direction = Direction.RIGHT;
    else if (z < pz) draft.players[player].direction = Direction.UP;
    else if (z > pz) draft.players[player].direction = Direction.DOWN;

    draft.players[player].prevPosition = draft.players[player].position;
    draft.players[player].position = position;
  },
  arriveAt: (draft: LevelState, player: number, x: number, z: number) => {
    const { level } = draft;
    if (!level) return;
    const cell = level.layers[LAYER_FOR_PLAYER[player]][z]?.[x];
    if (!cell) return;
    if (cell.trigger) {
      console.debug("player " + player + " toggled to " + !draft.toggled);
      draft.toggled = !draft.toggled;
    }
    const [fx, fz] = level.finish.position;
    if (x === fx && z === fz) {
      // player arrived at finish, check if the other player is also there
      const [ox, , oz] = draft.players[1 - player].position;
      if (ox === fx && oz === fz) {
        draft.completed = true;
      }
    }
  },
  collectItem: (draft: LevelState, player: number, id: string) => {
    draft.bag[id] = true;
    console.debug("[game-state] action invoked: collectItem(" + player + ", " + id + ")");
  },
  useItem: (draft: LevelState, player: number, id: string) => {
    draft.bag[id] = false;
    console.debug("[game-state] action invoked: useItem(" + player + ", " + id + ")");
  },
};

const { context, initialValue: extractedInitialValue } = createImmerStateContext(initialState, actions);

export type LevelStateApi = (typeof extractedInitialValue)[1];

export const useLevelState = () => {
  return useContext(context);
};

const LevelStateProvider = ({ children }: PropsWithChildren<{}>) => {
  const [{ levelIndex, invalidationFlag }, gameApi] = useGameState();
  const [, api, value] = useImmerStateProvider(initialState, actions);
  const [playFinished] = useSound(Sounds.FINISH);

  useEffect(() => {
    const level = Levels[levelIndex];
    api.initialize(level);
    console.log("level " + levelIndex + " initialized");
  }, [levelIndex, api, invalidationFlag]);

  const completed = value[0].completed;
  useEffect(() => {
    if (completed) {
      playFinished();
    }
  }, [completed]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "1") {
        gameApi.levelInitialize(0);
      } else if (e.key === "2") {
        gameApi.levelInitialize(1);
      } else if (e.key === "Escape") {
        gameApi.homeScreen();
      } else if (e.key === "Backspace") {
        api.initialize();
      }
    };
    window.addEventListener("keyup", keyHandler);
    return () => window.removeEventListener("keyup", keyHandler);
  }, [api, gameApi]);

  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <context.Provider value={value}>{children}</context.Provider>
    </KeyboardControls>
  );
};

export default LevelStateProvider;
