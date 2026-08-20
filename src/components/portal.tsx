import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ComponentProps, useRef } from "react";
import { DoubleSide, Mesh } from "three";

const SPIN_SPEED = 1.5; // radians per second

const Portal = ({ size = 2, ...props }: { size?: number } & Omit<ComponentProps<"mesh">, "args">) => {
  const texture = useTexture("/assets/textures/portal.png");
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += SPIN_SPEED * delta;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} scale={0.5} {...props}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
};

export default Portal;
