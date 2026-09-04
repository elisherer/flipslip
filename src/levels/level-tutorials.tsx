import { Text } from "@react-three/drei";

import { Level } from "@/levels/level-schema";
import { rot } from "@/utils/constants";

/**
 * helpers: ← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇐ ⇑ ⇒ ⇓ ⟶ ⟵ ⟷ ⇧ ⭡
 */
export default function LevelTutorials({ level }: { level: Level }) {
  if (level.tutorial === 1) {
    return (
      <group>
        <Text position={[2, 0.45, -0.44]} fontSize={0.2}>{`←                   →`}</Text>
        <Text position={[2, 0.5, -0.44]} fontSize={0.2}>{`
Air
Triggers`}</Text>
        <Text rotation={rot.x270} position={[2, 0.01, 2]} fontSize={0.2}>{`←                   →`}</Text>
        <Text rotation={rot.x270} position={[2, 0.01, 1.9]} fontSize={0.2}>{`
Ground
Triggers`}</Text>
        <Text rotation={rot.x270} position={[2, 0.01, 2.75]} fontSize={0.2} textAlign="center">{`
Toggles ALL * Doorways & Triggers *
between OPEN and CLOSED
Players can interact with triggers on their layer only!`}</Text>

        <Text
          position={[-0.3, 0.1, 4.57]}
          fontSize={0.2}
          anchorY="top-baseline"
          anchorX="left"
        >{`Ground Doorway →`}</Text>
        <Text position={[2.5, 0.45, 4.57]} fontSize={0.2} anchorY="top-baseline" anchorX="left">{`← Air Doorway`}</Text>

        <Text
          rotation={rot.x270}
          position={[2.6, 0.01, 6]}
          fontSize={0.2}
          anchorY="top"
          anchorX="left"
        >{`← Finish`}</Text>
        <Text rotation={rot.x270} position={[2, 0.01, 6.75]} fontSize={0.2} textAlign="center">{`The goal is to bring
BOTH players here!`}</Text>
      </group>
    );
  }
  if (level.tutorial === 2) {
    return (
      <group>
        <Text
          rotation={rot.x270}
          position={[1.5, 0.01, 2]}
          fontSize={0.2}
          anchorY="top"
          anchorX="left"
        >{`← Switch Trigger`}</Text>

        <Text
          rotation={rot.x270}
          position={[0.2, 0.01, 2.5]}
          fontSize={0.2}
          anchorY="top"
          anchorX="left"
          textAlign="center"
        >{`In addition to being
a regular trigger it also 
switches between the players positions
        `}</Text>
      </group>
    );
  }
}
