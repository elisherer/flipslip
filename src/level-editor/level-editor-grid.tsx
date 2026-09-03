import { useMemo } from "react";

import { Cell, WallState, isTriggerPushed } from "@/levels/level-schema";

import styles from "./level-editor-grid.module.css";

const CELL_SIZE = 40;
const WALL_THICKNESS = 5;
const EDGE_HIT = 10;

const EDGE_STYLE: Record<WallState | 0, string> = {
  0: styles.edgeOpen,
  1: styles.edgeWall,
  2: styles.edgeGreen,
  3: styles.edgeGreen,
  4: styles.edgePurple,
  5: styles.edgePurple,
};

const cellCenter = (x: number, z: number) => {
  const left = x * CELL_SIZE + WALL_THICKNESS / 2;
  const top = z * CELL_SIZE + WALL_THICKNESS / 2;
  const inner = CELL_SIZE - WALL_THICKNESS;
  return [left + inner / 2, top + inner / 2] as const;
};

/** Toggle walls that start closed (3/5) get a hatch overlay in the editor. */
function startsClosed(state?: WallState): boolean {
  return state === 3 || state === 5;
}

type EditorCell = { x: number; z: number; cell: Cell | null };

function FinishMarker({ position }: { position: [number, number] }) {
  const [fx, fy] = cellCenter(...position);
  return (
    <g pointerEvents="none">
      <rect
        x={fx - CELL_SIZE * 0.22}
        y={fy - CELL_SIZE * 0.22}
        width={CELL_SIZE * 0.44}
        height={CELL_SIZE * 0.44}
        className={styles.finish}
      />
      <text x={fx} y={fy} className={styles.markerLabel}>
        F
      </text>
    </g>
  );
}

function PlayerPositionMarker({ position }: { position: [number, number] }) {
  const [px, py] = cellCenter(...position);
  return (
    <g pointerEvents="none">
      <circle cx={px} cy={py} r={CELL_SIZE * 0.28} className={styles.player} />
      <text x={px} y={py} className={styles.markerLabel}>
        P
      </text>
    </g>
  );
}

export default function LevelEditorGrid({
  grid,
  width,
  height,
  playerPosition,
  finishPosition,
  crosshair,
  onCellCycle,
  onRightEdgeCycle,
  onDownEdgeCycle,
}: {
  grid: (Cell | null)[][];
  width: number;
  height: number;
  playerPosition: [number, number];
  finishPosition: [number, number];
  crosshair?: boolean;
  onCellCycle: (x: number, z: number, backward: boolean) => void;
  onRightEdgeCycle: (x: number, z: number, backward: boolean) => void;
  onDownEdgeCycle: (x: number, z: number, backward: boolean) => void;
}) {
  const svgWidth = width * CELL_SIZE + WALL_THICKNESS;
  const svgHeight = height * CELL_SIZE + WALL_THICKNESS;

  const cells = useMemo(() => {
    const items: EditorCell[] = [];
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        items.push({ x, z, cell: grid[z]?.[x] ?? null });
      }
    }
    return items;
  }, [grid, width, height]);

  return (
    <svg
      className={styles.grid + (crosshair ? " " + styles.placing : "")}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      onContextMenu={e => e.preventDefault()}
    >
      <defs>
        <pattern id="wallHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.6)" strokeWidth="3" />
        </pattern>
      </defs>
      {/* cell bodies + triggers, painted first */}
      {cells.map(({ x, z, cell }) => {
        const left = x * CELL_SIZE + WALL_THICKNESS / 2;
        const top = z * CELL_SIZE + WALL_THICKNESS / 2;
        const inner = CELL_SIZE - WALL_THICKNESS;
        const triggerColor = cell?.trigger
          ? cell.trigger === 1 || cell.trigger === 2
            ? "#4fca75"
            : "#a666d8"
          : undefined;
        const triggerPushed = cell?.trigger ? isTriggerPushed(cell.trigger, false) : false;
        return (
          <g key={x + ":" + z}>
            <rect
              x={left}
              y={top}
              width={inner}
              height={inner}
              className={cell ? ((x + z) % 2 ? styles.cellOpen : styles.cellOpenModulu) : styles.cellNone}
              onClick={() => onCellCycle(x, z, false)}
              onContextMenu={e => {
                e.preventDefault();
                onCellCycle(x, z, true);
              }}
            />
            {cell?.trigger && (
              <>
                {/* trunk */}
                <rect
                  fill={triggerColor}
                  stroke="black"
                  width={10}
                  height={triggerPushed ? 4 : 10}
                  x={left + 12}
                  y={top + (triggerPushed ? 18 : 12)}
                  pointerEvents="none"
                />
                {/* knob */}
                <rect
                  fill={triggerColor}
                  stroke="black"
                  width={18}
                  height={4}
                  x={left + 8}
                  y={top + (triggerPushed ? 15 : 10)}
                  pointerEvents="none"
                />
                {/* base */}
                <rect fill="#888" stroke="black" width={18} height={4} x={left + 8} y={top + 22} pointerEvents="none" />
              </>
            )}
          </g>
        );
      })}
      {/* edge (wall) indicators, painted on top so they're never hidden by a neighbor cell */}
      {cells.map(({ x, z, cell }) => {
        if (!cell) return null;
        const left = x * CELL_SIZE + WALL_THICKNESS / 2;
        const top = z * CELL_SIZE + WALL_THICKNESS / 2;
        const inner = CELL_SIZE - WALL_THICKNESS;
        return (
          <g key={"edges:" + x + ":" + z}>
            {x < width - 1 && (
              <>
                <rect
                  x={left + inner - EDGE_HIT / 2}
                  y={top}
                  width={EDGE_HIT}
                  height={inner}
                  className={EDGE_STYLE[cell.right ?? 0]}
                  onClick={() => onRightEdgeCycle(x, z, false)}
                  onContextMenu={e => {
                    e.preventDefault();
                    onRightEdgeCycle(x, z, true);
                  }}
                />
                {startsClosed(cell.right) && (
                  <rect
                    x={left + inner - EDGE_HIT / 2}
                    y={top}
                    width={EDGE_HIT}
                    height={inner}
                    fill="url(#wallHatch)"
                    pointerEvents="none"
                  />
                )}
              </>
            )}
            {z < height - 1 && (
              <>
                <rect
                  x={left}
                  y={top + inner - EDGE_HIT / 2}
                  width={inner}
                  height={EDGE_HIT}
                  className={EDGE_STYLE[cell.down ?? 0]}
                  onClick={() => onDownEdgeCycle(x, z, false)}
                  onContextMenu={e => {
                    e.preventDefault();
                    onDownEdgeCycle(x, z, true);
                  }}
                />
                {startsClosed(cell.down) && (
                  <rect
                    x={left}
                    y={top + inner - EDGE_HIT / 2}
                    width={inner}
                    height={EDGE_HIT}
                    fill="url(#wallHatch)"
                    pointerEvents="none"
                  />
                )}
              </>
            )}
          </g>
        );
      })}
      {/* player start + finish markers, always on top */}
      <PlayerPositionMarker position={playerPosition} />
      <FinishMarker position={finishPosition} />
    </svg>
  );
}
