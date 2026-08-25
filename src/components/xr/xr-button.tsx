import { Text } from "@react-three/drei";
import { ComponentProps, useState } from "react";

export default function XrButton({
  label,
  fontSize,
  disabled,
  color = "#606060",
  hoverColor = "#e0e0e0",
  opacity,
  position,
  ...props
}: {
  label?: string;
  fontSize?: number;
  disabled?: boolean;
  color?: string;
  hoverColor?: string;
  opacity?: number;
} & ComponentProps<"mesh">) {
  const [buttonHover, setButtonHover] = useState(false);
  return (
    <group position={position}>
      {label ? (
        <Text position={[0, 0, 0.6]} fontSize={fontSize} color={disabled ? "#808080" : undefined}>
          {label}
        </Text>
      ) : undefined}
      <mesh
        pointerEventsType={{ deny: "grab" }}
        onPointerEnter={() => !disabled && setButtonHover(true)}
        onPointerLeave={() => !disabled && setButtonHover(false)}
        {...props}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={buttonHover ? hoverColor : color}
          opacity={opacity ?? (disabled ? 0.8 : undefined)}
          transparent
        />
      </mesh>
    </group>
  );
}
