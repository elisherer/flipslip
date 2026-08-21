import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ComponentProps, useRef } from "react";
import { DoubleSide, Mesh } from "three";

const Portal = ({ size = 2, ...props }: { size?: number } & Omit<ComponentProps<"mesh">, "args">) => {
  const texture = useTexture("/assets/textures/portal.png");
  const ref = useRef<Mesh>(null);
  const startTime = useRef<number>(null);

  useFrame(state => {
    if (!ref.current) return;
    if (startTime.current === null) {
      startTime.current = state.clock.getElapsedTime();
    }
    const time = startTime.current - state.clock.getElapsedTime();
    ref.current.rotation.z = time % (2 * Math.PI);

    ref.current.scale.x = 0.38 + 0.04 * Math.cos(time % (2 * Math.PI));
    ref.current.scale.y = 0.38 + 0.04 * Math.sin(time % (2 * Math.PI));
    ref.current.scale.z = 0.5;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} receiveShadow {...props}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
};

export default Portal;
