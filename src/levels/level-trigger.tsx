import { Cylinder, Ring, Sphere } from "@react-three/drei";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { BackSide, Color, Mesh, MeshStandardMaterial, SphereGeometry } from "three";

import useMovingBody from "@/hooks/use-moving-body";
import { TriggerState, isSwitchTrigger, isTriggerPushed } from "@/levels/level-schema";
import { LevelThemeId, THEMES } from "@/levels/themes/level-theme";
import { rot } from "@/utils/constants";

const COLOR_1 = new Color(4.2, 0.2, 0.2); //"#50c050");
const COLOR_2 = new Color("#904040");
const SWITCH_1 = new Color(0.2, 0.2, 4.2); //"#c050c0");
const SWITCH_2 = new Color("#404090");

export default function LevelTrigger({
  state,
  theme = LevelThemeId.SPACE,
  toggled,
  floating,
  ...props
}: { state: TriggerState; theme?: LevelThemeId; toggled: boolean; floating?: boolean } & ComponentProps<"group">) {
  const [animating, setAnimating] = useState<boolean>(false);
  const ref = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const isSwitch = isSwitchTrigger(state);
  const pushed = isTriggerPushed(state, toggled);

  useMovingBody(
    {
      type: "fall",
      enabled: animating,
      from: pushed ? [0, -0.01, 0] : [0, -0.05, 0],
      to: pushed ? [0, -0.05, 0] : [0, -0.01, 0],
      step: 0.1,
    },
    (x, y, z, p) => {
      if (ref.current && animating) {
        if (!floating) {
          ref.current.position.x = x;
          ref.current.position.y = y;
          ref.current.position.z = z;
        } else {
          ref.current.geometry.dispose();
          ref.current.geometry = new SphereGeometry(0.1 + 0.1 * (pushed ? 1 - p : p));
          (ref.current.material as MeshStandardMaterial).opacity = p * (pushed ? 0.66 : 0.9);
          //as SphereGeometry;
        }
        if (matRef.current) {
          const c1 = isSwitch ? SWITCH_1 : COLOR_1;
          const c2 = isSwitch ? SWITCH_2 : COLOR_2;
          matRef.current.color = c2.clone().lerp(c1, pushed ? 1 - p : p);
        }
      }
    },
    () => {
      setAnimating(false);
      console.log("stopping");
    },
  );

  useEffect(() => {
    setAnimating(true);
  }, [pushed]);

  const ButtonComponent = floating ? (
    <Sphere ref={ref} position={[0, 0.3, 0]} args={[0.2]} castShadow>
      <meshStandardMaterial ref={matRef} color={COLOR_1} transparent opacity={0.9} />
    </Sphere>
  ) : (
    <Cylinder ref={ref} position={[0, -0.05, 0]} args={[/*tr*/ 0.17, /*br*/ 0.4, /*h*/ 0.2]}>
      <meshStandardMaterial ref={matRef} color={COLOR_1} />
    </Cylinder>
  );

  return (
    <group {...props}>
      {!floating && (
        <>
          <Ring rotation={rot.x270} position={[0, 0.05, 0]} args={[/*ir*/ 0.225, /*or*/ 0.3]}>
            <meshStandardMaterial color={THEMES[theme!].trigger.top} />
          </Ring>
          <Cylinder args={[/*tr*/ 0.3, /*br*/ 0.3, /*h*/ 0.1, undefined, undefined, /*open*/ true]}>
            <meshStandardMaterial color={THEMES[theme!].trigger.out} />
          </Cylinder>
          <Cylinder args={[/*tr*/ 0.225, /*br*/ 0.225, /*h*/ 0.1, undefined, undefined, /*open*/ true]}>
            <meshStandardMaterial color={THEMES[theme!].trigger.in} side={BackSide} />
          </Cylinder>
        </>
      )}
      {ButtonComponent}
    </group>
  );
}
