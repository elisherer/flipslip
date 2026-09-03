import { PropsWithChildren, useContext, useEffect } from "react";
import { createImmerStateContext, useImmerStateProvider } from "use-immer-state-provider";

import { DefaultCharacterSkin, Skin, Skins } from "@/assets/kit";
import { GameState } from "@/types/game-state";

import useAudioLockStatus from "../hooks/use-audio-lock-status";
import Storage from "./storage";

export const initialState: GameState = {
  windowHasFocus: true,
  audioLocked: true, // assume audio is locked on page load
  debug: false,
  settings: Storage.loadSettings({
    audio: true,
    hq: true,
  }),
  inLevel: false,
  levelIndex: 0,
  invalidationFlag: 0,
  character: Skins[DefaultCharacterSkin],
  progress: {
    lastCompletedIndex: -1,
  },
};

const actions = {
  unlockAudio: (draft: GameState) => {
    draft.audioLocked = false;
    console.debug("[game-state] action invoked: unlockAudio");
  },
  changeSetting: (draft: GameState, key: keyof GameState["settings"], value: any) => {
    draft.settings[key] = value;
    draft.audioLocked = false;
    console.debug("[game-state] action invoked: changeSetting", key, value);
  },
  homeScreen: (draft: GameState) => {
    draft.inLevel = false;
  },
  levelComplete: (draft: GameState, levelIndex: number) => {
    draft.progress.lastCompletedIndex = Math.max(draft.progress.lastCompletedIndex, levelIndex);
    console.debug("[game-state] action invoked: levelComplete", levelIndex);
  },
  levelInitialize: (draft: GameState, levelIndex?: number) => {
    draft.invalidationFlag = 1 - draft.invalidationFlag;
    if (typeof levelIndex === "number") draft.levelIndex = levelIndex;
    draft.inLevel = true;
    console.debug("[game-state] action invoked: levelInitialize", levelIndex);
  },
  toggleDebug: (draft: GameState) => {
    draft.debug = !draft.debug;
  },
  setSkin: (draft: GameState, skin: Skin) => {
    draft.character = Skins[skin] ?? Skins.mannequin;
    console.debug("[game-state] action invoked: setSkin", skin);
  },
  setWindowHasFocus: (draft: GameState, focus: boolean) => {
    draft.windowHasFocus = focus;
    console.debug("[game-state] action invoked: setWindowHasFocus", focus);
  },
  loadProgress: (draft: GameState, progress: GameState["progress"]) => {
    draft.progress = progress;
    console.debug("[game-state] action invoked: loadProgress", progress);
  },
};

const { context, initialValue: extractedInitialValue } = createImmerStateContext(initialState, actions);

export type GameStateApi = (typeof extractedInitialValue)[1];

export const useGameState = () => {
  return useContext(context);
};

const GameStateProvider = ({ children, initialLevelIndex }: PropsWithChildren<{ initialLevelIndex?: number }>) => {
  const [{ progress, settings }, api, value] = useImmerStateProvider(
    initialLevelIndex !== undefined ? { ...initialState, inLevel: true, levelIndex: initialLevelIndex } : initialState,
    actions,
  );
  const audioLocked = useAudioLockStatus();
  useEffect(() => {
    Storage.saveProgress(progress);
  }, [progress]);
  useEffect(() => {
    Storage.saveSettings(settings);
  }, [settings]);
  useEffect(() => {
    Storage.loadProgress().then(progress => {
      if (progress) {
        api.loadProgress(progress);
      }
    });
  }, [api]);
  useEffect(() => {
    if (!audioLocked) {
      api.unlockAudio();
    }
  }, [api, audioLocked]);
  useEffect(() => {
    const onVisibilityChanged = () => {
      api.setWindowHasFocus(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibilityChanged);
    return () => document.removeEventListener("visibilitychange", onVisibilityChanged);
  }, [api]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

export default GameStateProvider;
