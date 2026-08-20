import { ComponentProps, useMemo } from "react";

import { rot } from "@/utils/constants";

export default function LaserWall({
  isOn,
  position,
  rotation,
  length,
  amount = 3,
}: {
  isOn: boolean;
  position: ComponentProps<"group">["position"];
  rotation?: ComponentProps<"group">["rotation"];
  length: number;
  amount?: number;
}) {
  const lasers = useMemo(() => {
    const meshes: any[] = [];
    for (let i = 0; i < amount; i++) {
      meshes.push(
        <mesh key={i} position={[0, 0.1 + i * 0.2, 0]} rotation={rot.x270} renderOrder={-1}>
          <cylinderGeometry args={[0.02, 0.02, length, 6]} />
          <meshBasicMaterial color="#dd2200" opacity={0.25} transparent />
        </mesh>,
      );
    }
    return meshes;
  }, [amount, length]);
  return (
    <group visible={!isOn} position={position} rotation={rotation}>
      {lasers}
    </group>
  );
}
