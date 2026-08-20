import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { EasingType, easings } from "./easings";

export type MovingBodyType = "loop" | "fall";
export type MoveOptions = {
  type?: MovingBodyType;
  from?: [x: number, y: number, z: number];
  to?: [x: number, y: number, z: number];
  enabled?: boolean; // default is true
  initialProgress?: number;
  initialDirection?: boolean;
  step?: number;
  easingType?: EasingType;
};

export default function useMovingBody(
  {
    type,
    from,
    to,
    enabled = true,
    initialProgress = 0,
    initialDirection = true,
    step = 0.003,
    easingType = "easeInOutSine",
  }: MoveOptions = {},
  onChange: (x: number, y: number, z: number, progress: number) => any,
  /**
   * When movement reaches the 'to' position
   */
  onMovementEnd?: () => boolean | any,
) {
  const progress = useRef<number>(initialProgress);
  const direction = useRef<boolean>(initialDirection);

  useFrame(() => {
    if (!from || !to) return;
    const previousProgress = progress.current;
    switch (type) {
      case "loop": {
        if (!enabled) return;
        // change direction
        if (progress.current >= 1) {
          direction.current = false;
        } else if (progress.current <= 0) {
          direction.current = true;
        }
        progress.current += direction.current ? step : -step;
        break;
      }
      case "fall": {
        if (previousProgress === (enabled ? 1 : 0)) {
          return;
        }
        progress.current = progress.current + (enabled ? step : -step);
        break;
      }
    }
    // clamp
    if (progress.current > 1) {
      progress.current = 1;
    } else if (progress.current < 0) {
      progress.current = 0;
    }
    if (previousProgress !== 1 && progress.current === 1 && onMovementEnd) {
      const result = onMovementEnd();
      if (result === true) {
        progress.current = 0;
      }
    }

    if (previousProgress === progress.current) return;

    const p = easings[easingType ?? "linear"](progress.current);
    const [x1, y1, z1] = from;
    const [x2, y2, z2] = to;
    onChange(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, z1 + (z2 - z1) * p, p);
  });
}
