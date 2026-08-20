import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";

import { useLevelState } from "@/providers/level-state-provider";
import { useScene } from "@/providers/scene-provider";

const CAMERA_DIR = new Vector3(0, Math.PI, Math.PI * 0.5);
CAMERA_DIR.normalize();

export default function useCameraFollowPlayers(debug: boolean) {
  const [levelState] = useLevelState();
  const cameraLocation = useRef<Vector3>(new Vector3());
  const cameraTarget = useRef<Vector3>(new Vector3());
  const [{ cameraControls }] = useScene();
  const cameraControlsRef = useRef(cameraControls);
  if (cameraControlsRef.current !== cameraControls) {
    cameraControlsRef.current = cameraControls;
  }

  useFrame(() => {
    // Update camera follow target and up direction
    if (!debug && cameraControlsRef.current) {
      // calculate target location based on middle point of 2 players positions
      const p1 = levelState.players[0].position;
      const p2 = levelState.players[1].position;
      cameraTarget.current.x = (p1[0] + p2[0]) / 2 - (levelState.level?.width ?? 0) / 2;
      cameraTarget.current.y = (p1[1] + p2[1]) / 2;
      cameraTarget.current.z = (levelState.level?.height ?? 0) / 4;
      const distance = Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2);
      const cameraDistance = Math.max(4, distance / 2);
      // Move camera pivot to target position
      cameraLocation.current.copy(cameraTarget.current).addScaledVector(CAMERA_DIR, cameraDistance);
      cameraControlsRef.current.setPosition(
        cameraLocation.current.x,
        cameraLocation.current.y,
        cameraLocation.current.z,
        true,
      );
      cameraControlsRef.current.moveTo(
        cameraTarget.current.x,
        cameraTarget.current.y + 1,
        cameraTarget.current.z,
        true,
      );
    }
  });
}
