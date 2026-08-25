import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { ColorRepresentation, PCFShadowMap } from "three";

import Lights from "@/components/lights";
import LevelGeometry from "@/levels/level-geometry";
import { Level } from "@/levels/level-schema";

import styles from "./level-editor-preview.module.css";

const BG_COLOR: [color: ColorRepresentation] = ["#0a0a12"];

export default function LevelEditorPreview({ level }: { level: Level }) {
  const [toggled, setToggled] = useState(false);
  const radius = (Math.max(level.width, level.height, 4) * 1.3) / 2;

  return (
    <div className={styles.previewPane}>
      <div className={styles.toolbar}>
        <label>
          <input type="checkbox" checked={toggled} onChange={e => setToggled(e.target.checked)} />
          Preview toggled state
        </label>
      </div>
      <Canvas
        key={level.width + ":" + level.height}
        className={styles.canvas}
        shadows={{ type: PCFShadowMap }}
        camera={{ position: [0, radius * 0.85, radius], near: 0.1, far: 500 }}
      >
        <color attach="background" args={BG_COLOR} />
        <Lights />
        <LevelGeometry level={level} toggled={toggled} debug preview />
        <CameraControls makeDefault />
      </Canvas>
    </div>
  );
}
