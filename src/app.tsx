import { useState } from "react";

import { LevelCanvas } from "@/levels/level-canvas";
import { LevelSelection } from "@/levels/level-selection";

import Hud from "./components/hud/hud";
import LevelEditor from "./level-editor/level-editor";
import GameStateProvider from "./providers/game-state-provider";
import { isLocalDev } from "./utils/constants";

export default function App() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLevelIndex, setEditorLevelIndex] = useState<number | undefined>(undefined);

  const openEditor = (levelIndex?: number) => {
    setEditorLevelIndex(levelIndex);
    setEditorOpen(true);
  };

  if (editorOpen) {
    return <LevelEditor onExit={() => setEditorOpen(false)} initialLevelIndex={editorLevelIndex} />;
  }

  return (
    <GameStateProvider>
      <Hud onOpenEditor={isLocalDev ? openEditor : undefined} />
      <LevelCanvas />
      <LevelSelection />
    </GameStateProvider>
  );
}
