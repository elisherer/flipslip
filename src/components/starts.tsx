import { PointMaterial, Points } from "@react-three/drei";
import { ThreeElements, useFrame } from "@react-three/fiber";
import * as random from "maath/random";
import { useRef, useState } from "react";
import { Points as THREEPoints } from "three";

import { rot } from "@/utils/constants";

export default function Stars(props: Omit<ThreeElements["points"], "ref">) {
  const ref = useRef<THREEPoints>(null!);
  const [sphere] = useState(() => random.inSphere(new Float32Array(3001), { radius: 40 }) as Float32Array);
  useFrame((_state, delta) => {
    ref.current.rotation.x -= delta / 100;
    ref.current.rotation.y -= delta / 100;
  });
  return (
    <group rotation={rot.z90}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color={[2, 2, 1.5]} size={0.02} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
}
