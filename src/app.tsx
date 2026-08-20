import { LevelCanvas } from "@/levels/level-canvas";
import { LevelSelection } from "@/levels/level-selection";

import Hud from "./components/hud/hud";
import GameStateProvider from "./providers/game-state-provider";

export default function App() {
  return (
    <GameStateProvider>
      <Hud />
      <LevelCanvas />
      <LevelSelection />
    </GameStateProvider>
  );
}
