import { Bvh } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { IfInSessionMode, PointerEvents, XR, noEvents } from "@react-three/xr";
import { Perf } from "r3f-perf";
import { PropsWithChildren, Suspense, useState } from "react";
import { PCFShadowMap } from "three";

import LevelCompleteModal from "@/components/modal/level-complete-modal";
import { xrStore } from "@/components/xr/store";
import LevelCarousel from "@/levels/level-carousel";
import { LevelScene } from "@/levels/level-scene";
import { LevelSelectionScene } from "@/levels/level-selection-scene";
import JoystickStateProvider from "@/providers/joystick-state-provider";

import Hud from "./components/hud/hud";
import LevelEditor from "./level-editor/level-editor";
import GameStateProvider, { useGameState } from "./providers/game-state-provider";
import { isLocalDev } from "./utils/constants";

function AppCanvas({ children }: PropsWithChildren<{}>) {
  const [{ settings, debug }] = useGameState();
  return (
    <Canvas
      shadows={settings.hq ? { type: PCFShadowMap } : false}
      gl={{
        antialias: settings.hq,
        alpha: true,
      }}
      camera={{
        near: 0.1,
        far: 500,
      }}
      events={noEvents}
    >
      <PointerEvents batchEvents={false} />
      <XR store={xrStore}>
        <Suspense>
          <Bvh firstHitOnly>
            {isLocalDev && debug && <Perf position="bottom-right" />}
            {children}
            <IfInSessionMode deny={["immersive-vr", "immersive-ar"]}>
              <EffectComposer enabled={settings.hq}>
                <Bloom mipmapBlur luminanceThreshold={0.3} intensity={0.3} levels={5} />
              </EffectComposer>
            </IfInSessionMode>
          </Bvh>
        </Suspense>
      </XR>
    </Canvas>
  );
}

export default function App() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLevelIndex, setEditorLevelIndex] = useState<number | undefined>(undefined);
  const [startLevelIndex, setStartLevelIndex] = useState<number | undefined>(undefined);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

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
        <AppCanvas>
          <LevelScene setCompleteDialogOpen={setCompleteDialogOpen} />
          <LevelSelectionScene />
        </AppCanvas>
        <LevelCarousel />
        <LevelCompleteModal open={completeDialogOpen} />
      </JoystickStateProvider>
    </GameStateProvider>
  );
}
