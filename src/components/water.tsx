import { useFrame } from "@react-three/fiber";
import { ComponentProps, useRef, useState } from "react";
import { MathUtils, Mesh, PlaneGeometry, Vector3 } from "three";

import { rot } from "@/utils/constants";

const v3 = new Vector3();

const calcVertData = (g: PlaneGeometry, maxAmplitude: number) => {
  const v: any[] = [];
  for (let i = 0; i < g.attributes.position.count; i++) {
    v3.fromBufferAttribute(g.attributes.position, i);
    v.push({
      initH: v3.z,
      amplitude: MathUtils.randFloatSpread(maxAmplitude),
      phase: MathUtils.randFloat(0, Math.PI),
    });
  }
  return v;
};

const Water = ({
  args,
  maxAmplitude = 1.5,
  ...props
}: {
  args: [width?: number, height?: number, widthSegments?: number, heightSegments?: number];
  maxAmplitude?: number;
} & Omit<ComponentProps<"group">, "args">) => {
  const ref = useRef<Mesh>(null);
  const [vertData, setVertData] = useState<any[] | null>(null);

  useFrame(state => {
    const g = ref.current?.geometry;
    if (g) {
      if (!vertData) {
        setVertData(calcVertData(g as PlaneGeometry, maxAmplitude));
        return;
      }
      let time = state.clock.getElapsedTime();
      vertData.forEach((vd, idx) => {
        let y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
        g.attributes.position.setZ(idx, y);
      });
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
      state.gl.render(state.scene, state.camera);
    }
  });

  return (
    <group {...props}>
      <mesh ref={ref as any} rotation={rot.x270} receiveShadow castShadow>
        <planeGeometry args={args} />
        <meshLambertMaterial color="#4499ff" />
      </mesh>
    </group>
  );
};

export default Water;
