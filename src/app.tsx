import { useState } from "react";

import { LevelCanvas } from "@/levels/level-canvas";
import { LevelSelection } from "@/levels/level-selection";
import JoystickStateProvider from "@/providers/joystick-state-provider";

import Hud from "./components/hud/hud";
import LevelEditor from "./level-editor/level-editor";
import GameStateProvider from "./providers/game-state-provider";
import { isLocalDev } from "./utils/constants";

export default function App() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLevelIndex, setEditorLevelIndex] = useState<number | undefined>(undefined);
  const [startLevelIndex, setStartLevelIndex] = useState<number | undefined>(undefined);

  const openEditor = (levelIndex?: number) => {
    setEditorLevelIndex(levelIndex);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setStartLevelIndex(undefined);
    setEditorOpen(false);
  };

  const tryItOut = (levelIndex: number) => {
    setStartLevelIndex(levelIndex);
    setEditorOpen(false);
  };

  if (editorOpen) {
    return <LevelEditor onExit={closeEditor} onTryItOut={tryItOut} initialLevelIndex={editorLevelIndex} />;
  }

  return (
    <GameStateProvider key={startLevelIndex} initialLevelIndex={startLevelIndex}>
      <JoystickStateProvider>
        <Hud onOpenEditor={isLocalDev ? openEditor : undefined} />
        <LevelCanvas />
        <LevelSelection />
      </JoystickStateProvider>
    </GameStateProvider>
  );
}
