import { useRef } from "react";
import { DirectionalLight } from "three";

import { useGameState } from "@/providers/game-state-provider";

export default function Lights() {
  const [{ debug }] = useGameState();
  const ref = useRef<DirectionalLight>(null);
  return (
    <>
      {debug && ref.current && <directionalLightHelper args={[ref.current, 1]} />}
      {debug && ref.current && <cameraHelper args={[ref.current.shadow.camera]} />}
      <directionalLight
        ref={ref}
        position={[-3, 13, -3]}
        castShadow
        shadow-normalBias={0.1}
        shadow-mapSize={[2048, 2048]}
        intensity={1.5}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-left={-20}
        shadow-camera-right={20}
      />
      <hemisphereLight />
    </>
  );
}
