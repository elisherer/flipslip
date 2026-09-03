import { ComponentProps, useMemo } from "react";
import { BoxGeometry, Color, Float32BufferAttribute } from "three";

import { WallState } from "@/levels/level-schema";
import { LevelThemeId, THEMES } from "@/levels/themes/level-theme";

function gradientBoxGeometry(
  args: ComponentProps<"boxGeometry">["args"],
  color1: Color, // bottom
  color2: Color, // top
) {
  const geometry = new BoxGeometry(...(args as any));
  const position = geometry.attributes.position;
  const colors = [];
  for (let i = 0; i < position.count; i++) {
    // Get Y coordinate (ranges roughly from -0.5 to 0.5 for a size 1 box)
    const y = position.getY(i);

    // Normalize Y from [-0.5, 0.5] to [0, 1]
    const mixFactor = y + 0.5;

    // Interpolate between the two colors
    const mixedColor = color1.clone().lerp(color2, mixFactor);

    colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

export default function LevelWall({
  boxArgs,
  state,
  opacity,
  theme = LevelThemeId.SPACE,
  layerIndex,
  ...props
}: {
  boxArgs: NonNullable<ComponentProps<"boxGeometry">["args"]>;
  state?: WallState;
  opacity?: number;
  theme?: LevelThemeId;
  layerIndex: number;
} & ComponentProps<"mesh">) {
  const geometry = useMemo(() => {
    const wallColors = THEMES[theme!].wallColors;
    const [c1, c2] = state ? wallColors[layerIndex][state] : wallColors[layerIndex][1];
    return gradientBoxGeometry(boxArgs, c1, c2);
  }, [boxArgs[0], boxArgs[1], boxArgs[2], boxArgs[3], boxArgs[4], boxArgs[5], theme, layerIndex, state]);
  return (
    <mesh castShadow receiveShadow {...props}>
      <primitive object={geometry} />
      <meshPhongMaterial
        attach="material-0" // front
        vertexColors
        opacity={opacity}
        transparent={typeof opacity === "number" && opacity < 1}
      />
      <meshPhongMaterial
        attach="material-1" // back
        vertexColors
        opacity={opacity}
        transparent={typeof opacity === "number" && opacity < 1}
      />
      <meshPhongMaterial
        attach="material-2"
        vertexColors
        opacity={typeof opacity === "number" ? opacity / 2 : undefined}
        transparent={typeof opacity === "number" && opacity < 1}
      />
      <meshPhongMaterial
        attach="material-3" // right
        vertexColors
        opacity={typeof opacity === "number" ? opacity / 2 : undefined}
        transparent={typeof opacity === "number" && opacity < 1}
      />
      <meshPhongMaterial
        attach="material-4" // left
        vertexColors
        opacity={opacity}
        transparent={typeof opacity === "number" && opacity < 1}
      />
      <meshPhongMaterial
        attach="material-5" // left
        vertexColors
        opacity={opacity}
        transparent={typeof opacity === "number" && opacity < 1}
      />
    </mesh>
  );
}
