import { KeyboardControls } from "@react-three/drei";
import { PropsWithChildren, useContext, useEffect } from "react";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";

import { CellType, LevelDefinition } from "@/levels/level-definition";
import { Levels } from "@/levels/levels";
import { useGameState } from "@/providers/game-state-provider";
import { KEYBOARD_MAP } from "@/providers/keyboard-map";
import { Direction } from "@/types/direction";
import { LevelState } from "@/types/level-state";

const EMPTY_STATE: LevelState = {
  level: Levels[0],
  bag: {},
  toggled: false,
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
  level: LevelDefinition | undefined,
  player: number,
  toggled: boolean,
  x: number,
  z: number,
) {
  if (!level) return true;
  const cell = level.layers[player][z]?.[x];
  if (!cell) return false;
  if (cell.type === CellType.WALL) return false;
  if (cell.type === CellType.TOGGLE_WALL && level.initialState[cell.toggle_id] !== toggled) return false;
  return true;
}

const actions = {
  initialize: (draft: LevelState, level?: LevelDefinition) => {
    draft.level = level ?? draft.level;
    draft.toggled = false;
    draft.bag = {};
    if (draft.level) {
      draft.players = draft.level.players.map(p => ({
        position: p.position.slice() as typeof p.position,
        direction: Direction.DOWN,
      }));
    }
  },
  moveTo: (draft: LevelState, player: number, position: [x: number, y: number, z: number]) => {
    const { level } = draft;
    if (!level) return;
    const [x, , z] = position;

    if (!canEnterCell(level, player, draft.toggled, x, z)) return;

    const [px, , pz] = draft.players[player].position;
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
    const cell = level.layers[player][z][x];
    if (!cell) return;
    if (cell.type === CellType.TOGGLE) {
      console.debug("player " + player + " toggled to " + !draft.toggled);
      draft.toggled = !draft.toggled;
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
  useEffect(() => {
    const level = Levels[levelIndex];
    api.initialize(level);
    console.log("level " + levelIndex + " initialized");
  }, [levelIndex, api, invalidationFlag]);

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
