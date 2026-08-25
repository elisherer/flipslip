import { useFrame } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";

import { xrStore } from "@/components/xr/store";

export default function VRPlayerControls() {
  //const controllerLeft = useXRInputSourceState("controller", "left");
  const controllerRight = useXRInputSourceState("controller", "right");

  useFrame(() => {
    if (controllerRight?.gamepad?.["b-button"]?.state === "pressed") {
      xrStore.getState().session?.end();
    }
  });
  return null;
}
