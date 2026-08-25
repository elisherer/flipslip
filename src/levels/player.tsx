import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";

import KitModel from "@/components/kit-model";
import useThumbstickDirection from "@/components/xr/useThumbstickDirection";
import { easings } from "@/hooks/easings";
import { JoystickState, useJoystickState } from "@/providers/joystick-state-provider";
import { KeyControl } from "@/providers/keyboard-map";
import { canEnterCell, useLevelState } from "@/providers/level-state-provider";
import { Direction } from "@/types/direction";
import isTouchDevice from "@/utils/is-touch-device";

const MOVE_SPEED = isTouchDevice ? 1.5 : 3; // units per second
const ROTATE_DAMP = 10;
const ARRIVE_EPSILON = 1e-4;

// A grid step doesn't jump straight to full speed or stop dead -- it eases in when a
// fresh move starts, and eases out once we know no further step is queued. Holding a
// direction across multiple chained cells keeps `willContinue` true the whole time, so
// speed never dips between cells -- only a genuine start/stop gets the curve. Deceleration
// is keyed off *remaining distance* to the target cell (not elapsed time) -- a "stopping"
// segment is classified as such from its very first frame (before any distance is
// covered), so a time-boxed ease-out would blow its whole budget miles from the target and
// crawl the rest of the way at the floor speed. Distance-based easing naturally spends
// most of the segment at full speed and only slows for the final approach, regardless of
// how much of the cell is left when the decision to stop was made.
const ACCEL_TIME = 0.18; // seconds to reach full speed from a standstill
const DECEL_FLOOR = 0.35; // never below this fraction of MOVE_SPEED while still traveling
const CELL_DISTANCE = 1; // grid cells are always exactly 1 unit apart
type MovePhase = "idle" | "accel" | "decel";

function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

const MOVES: Record<number, [KeyControl, [dx: number, dz: number]][]> = {
  0: [
    [KeyControl.up, [0, -1]],
    [KeyControl.down, [0, 1]],
    [KeyControl.left, [-1, 0]],
    [KeyControl.right, [1, 0]],
  ],
  1: [
    [KeyControl.ufo_up, [0, -1]],
    [KeyControl.ufo_down, [0, 1]],
    [KeyControl.ufo_left, [-1, 0]],
    [KeyControl.ufo_right, [1, 0]],
  ],
};

const JOYSTICK_MOVES: Record<string, [dx: number, dz: number]> = {
  FORWARD: [0, -1], // up
  BACKWARD: [0, 1], // down
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

const DIRECTION_MOVE: Record<Direction, [dx: number, dz: number]> = {
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.RIGHT]: [1, 0],
};

/** The direction the player currently wants to go, keyboard taking priority over joystick, then VR thumbstick. */
function getHeldMove(
  index: number,
  getKeys: () => Record<KeyControl, boolean>,
  joystickState: JoystickState,
  vrDirection?: Direction | null,
): [dx: number, dz: number] | null {
  const keys = getKeys();
  const held = MOVES[index].find(([control]) => keys[control]);
  if (held) return held[1];
  const jsDir = index === 1 ? joystickState.direction2 : joystickState.direction1;
  if (jsDir) return JOYSTICK_MOVES[jsDir] ?? null;
  return vrDirection != null ? DIRECTION_MOVE[vrDirection] : null;
}

const DIRECTION_ANGLE: Record<Direction, number> = {
  [Direction.DOWN]: 0,
  [Direction.UP]: Math.PI,
  [Direction.RIGHT]: Math.PI / 2,
  [Direction.LEFT]: -Math.PI / 2,
};

const CAMERA_DIR = new Vector3(0, Math.PI * 1.5, Math.PI * 0.75);
CAMERA_DIR.normalize();

export default function Player({ index, ...props }: { index: number } & ComponentProps<"group">) {
  const [levelState, api] = useLevelState();

  const ref = useRef<Group>(null);
  const movingRef = useRef(false);
  const [isMoving, setIsMoving] = useState(false);
  const levelRef = useRef(levelState);
  levelRef.current = levelState;
  const startTime = useRef<number>(null);
  const phaseRef = useRef<MovePhase>("idle");
  const phaseStartRef = useRef(0);

  const [joystickState] = useJoystickState();

  const vrDirection = useThumbstickDirection(index === 0 ? "left" : "right");

  useEffect(() => {
    const dir = index === 1 ? joystickState.direction2 : joystickState.direction1;
    const move = dir ? JOYSTICK_MOVES[dir] : vrDirection != null ? DIRECTION_MOVE[vrDirection] : null;
    if (!move || movingRef.current || levelRef.current.completed) return;
    const [x, y, z] = levelRef.current.players[index].position;
    const [dx, dz] = move;
    const [nx, nz] = [x + dx, z + dz];
    api.moveTo(index, [nx, y, nz]);
    movingRef.current = canEnterCell(levelRef.current.level, index, levelRef.current.toggled, x, z, nx, nz);
  }, [joystickState, vrDirection, index]);

  const [subscribeKeys, getKeys] = useKeyboardControls<KeyControl>();
  useEffect(() => {
    const unsubscribers = MOVES[index].map(([control, [dx, dz]]) =>
      subscribeKeys(
        state => state[control],
        pressed => {
          if (!pressed || movingRef.current || levelRef.current.completed) return;
          const [x, y, z] = levelRef.current.players[index].position;
          const [nx, nz] = [x + dx, z + dz];
          api.moveTo(index, [nx, y, nz]);
          movingRef.current = canEnterCell(levelRef.current.level, index, levelRef.current.toggled, x, z, nx, nz);
        },
      ),
    );
    return () => unsubscribers.forEach(unsub => unsub());
  }, [subscribeKeys, api, index]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const player = levelRef.current.players[index];

    const [tx, ty, tz] = player.position;

    if (index > 0) {
      if (startTime.current === null) {
        startTime.current = state.clock.getElapsedTime();
      }
      const time = startTime.current - state.clock.getElapsedTime();
      ref.current.rotation.set(0, time % (2 * Math.PI), 0);
    }

    if (!player.prevPosition) {
      ref.current.position.set(tx, ty, tz);
      movingRef.current = false;
      phaseRef.current = "idle";
      return;
    }

    if (movingRef.current) {
      // does the player want to (and can) continue past the current target cell?
      const now = state.clock.getElapsedTime();
      const heldMove = getHeldMove(index, getKeys, joystickState, vrDirection);
      const willContinue =
        !!heldMove &&
        canEnterCell(
          levelRef.current.level,
          index,
          levelRef.current.toggled,
          tx,
          tz,
          tx + heldMove[0],
          tz + heldMove[1],
        );

      if (phaseRef.current !== "accel" && phaseRef.current !== "decel") {
        phaseRef.current = "accel";
        phaseStartRef.current = now;
      } else if (phaseRef.current === "decel" && willContinue) {
        phaseRef.current = "accel";
        phaseStartRef.current = now;
      } else if (phaseRef.current === "accel" && !willContinue) {
        phaseRef.current = "decel";
      }

      let speedMult = 1;
      if (phaseRef.current === "accel") {
        speedMult = easings.easeInOutQuart(Math.min(1, (now - phaseStartRef.current) / ACCEL_TIME));
      } else if (phaseRef.current === "decel") {
        const remaining = Math.hypot(tx - ref.current.position.x, tz - ref.current.position.z);
        const remainingFrac = Math.min(1, remaining / CELL_DISTANCE);
        speedMult = DECEL_FLOOR + (1 - DECEL_FLOOR) * easings.easeInOutQuart(remainingFrac);
      }

      const step = MOVE_SPEED * delta * 1.4 * speedMult;
      ref.current.position.x = moveTowards(ref.current.position.x, tx, step);
      ref.current.position.y = moveTowards(ref.current.position.y, ty, step);
      ref.current.position.z = moveTowards(ref.current.position.z, tz, step);

      movingRef.current =
        Math.abs(ref.current.position.x - tx) >= ARRIVE_EPSILON ||
        Math.abs(ref.current.position.y - ty) >= ARRIVE_EPSILON ||
        Math.abs(ref.current.position.z - tz) >= ARRIVE_EPSILON;

      if (!movingRef.current) {
        api.arriveAt(index, tx, tz);
        if (heldMove && willContinue && !levelRef.current.completed) {
          const [x, y, z] = player.position;
          const [nx, nz] = [x + heldMove[0], z + heldMove[1]];
          api.moveTo(index, [nx, y, nz]);
          movingRef.current = true;
        } else {
          phaseRef.current = "idle";
        }
      }
    } else {
      phaseRef.current = "idle";
    }

    setIsMoving(prev => (prev !== movingRef.current ? movingRef.current : prev));

    if (index === 0) {
      const targetAngle = DIRECTION_ANGLE[player.direction];
      const diff = MathUtils.euclideanModulo(targetAngle - ref.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      if (diff) {
        ref.current.rotation.y = MathUtils.damp(
          ref.current.rotation.y,
          ref.current.rotation.y + diff,
          ROTATE_DAMP,
          delta,
        );
      }
    }
  });

  return (
    <group ref={ref} {...props}>
      {index > 0 ? (
        <KitModel
          receiveShadow={false}
          position={[0, -0.3, 0]}
          kit="td"
          model="enemy-ufo-a"
          variant="a"
          scale={[0.67, 0.4, 0.67]}
        />
      ) : (
        <KitModel
          kit="characters"
          model="Astronaut.gltf"
          scale={0.72}
          animate={isMoving ? "Walking" : "Idle"}
          loop
          animationTimeScale={isMoving ? 3 : 1}
          position={[0, -1, 0]}
        />
      )}
    </group>
  );
}
