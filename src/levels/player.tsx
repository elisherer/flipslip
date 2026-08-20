import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";

import KitModel from "@/components/kit-model";
import { KeyControl } from "@/providers/keyboard-map";
import { canEnterCell, useLevelState } from "@/providers/level-state-provider";
import { Direction } from "@/types/direction";

const MOVE_SPEED = 4; // units per second
const ROTATE_DAMP = 10;
const ARRIVE_EPSILON = 1e-4;

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

  const [subscribeKeys, getKeys] = useKeyboardControls<KeyControl>();

  useEffect(() => {
    const unsubscribers = MOVES[index].map(([control, [dx, dz]]) =>
      subscribeKeys(
        state => state[control],
        pressed => {
          if (!pressed || movingRef.current) return;
          const [x, y, z] = levelRef.current.players[index].position;
          const [nx, nz] = [x + dx, z + dz];
          api.moveTo(index, [nx, y, nz]);
          movingRef.current = canEnterCell(levelRef.current.level, index, levelRef.current.toggled, nx, nz);
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
      return;
    }

    const step = MOVE_SPEED * delta;
    ref.current.position.x = moveTowards(ref.current.position.x, tx, step);
    ref.current.position.y = moveTowards(ref.current.position.y, ty, step);
    ref.current.position.z = moveTowards(ref.current.position.z, tz, step);

    const wasMoving = movingRef.current;
    movingRef.current =
      Math.abs(ref.current.position.x - tx) >= ARRIVE_EPSILON ||
      Math.abs(ref.current.position.y - ty) >= ARRIVE_EPSILON ||
      Math.abs(ref.current.position.z - tz) >= ARRIVE_EPSILON;

    if (wasMoving && !movingRef.current) {
      api.arriveAt(index, tx, tz);
      const keys = getKeys();
      const held = MOVES[index].find(([control]) => keys[control]);
      if (held) {
        const [, [dx, dz]] = held;
        const [x, y, z] = player.position;
        const [nx, nz] = [x + dx, z + dz];
        api.moveTo(index, [nx, y, nz]);
        movingRef.current = canEnterCell(levelState.level, index, levelState.toggled, nx, nz);
      }
    }

    setIsMoving(prev => (prev !== movingRef.current ? movingRef.current : prev));

    if (index === 0 && movingRef.current) {
      const targetAngle = DIRECTION_ANGLE[player.direction];
      const diff = MathUtils.euclideanModulo(targetAngle - ref.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      ref.current.rotation.y = MathUtils.damp(
        ref.current.rotation.y,
        ref.current.rotation.y + diff,
        ROTATE_DAMP,
        delta,
      );
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
          //animationTimeScale={isMoving ? 3 : 1}
        />
      ) : (
        <KitModel
          kit="characters"
          model="Mannequin_Medium_Animated"
          variant="morty"
          scale={0.25}
          animate={isMoving ? "Walking_A" : "Idle_A"}
          loop
          animationTimeScale={isMoving ? 3 : 1}
          position={[0, -1, 0]}
        />
      )}
    </group>
  );
}
