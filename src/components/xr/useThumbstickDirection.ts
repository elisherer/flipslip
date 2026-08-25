import { XRControllerState } from "@pmndrs/xr";
import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import { useState } from "react";

import { Direction } from "@/types/direction";

const THUMBSTICK_ID = "xr-standard-thumbstick";

function getDirection(vrThumbstick?: XRControllerState["gamepad"][typeof THUMBSTICK_ID]): Direction | null {
  if (!vrThumbstick || (!vrThumbstick.yAxis && !vrThumbstick.xAxis)) {
    return null;
  }
  const x = vrThumbstick.xAxis ?? 0;
  const y = vrThumbstick.yAxis ?? 0;
  const angle = Math.atan2(y, x) * (180 / Math.PI); // right=0, down=90, left=+-180, up=-90

  if (angle > 135 || angle <= -135) return Direction.LEFT;
  if (angle > 45) return Direction.DOWN;
  if (angle > -45) return Direction.RIGHT;
  return Direction.UP;
}

export default function useThumbstickDirection(handedness?: XRHandedness, enabled = true) {
  if (!enabled) return;
  const vrController = useXRInputSourceState("controller", handedness);
  const [direction, setDirection] = useState<Direction | null>(null);

  useFrame(() => {
    const vrThumbstick = vrController?.gamepad[THUMBSTICK_ID];
    const vrDir = getDirection(vrThumbstick);
    if (vrDir !== direction) setDirection(vrDir);
  });

  return direction;
}
