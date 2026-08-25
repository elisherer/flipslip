import { MouseEvent, useMemo } from "react";

import { Cell, WallState } from "@/levels/level-schema";

import styles from "./level-editor-grid.module.css";

const CELL_SIZE = 40;
const WALL_THICKNESS = 5;
const EDGE_HIT = 10;

const EDGE_STYLE: Record<WallState, string> = {
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
function startsClosed(state: WallState): boolean {
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
  placing,
  onCellClick,
  onToggleTrigger,
  onCycleRight,
  onCycleDown,
}: {
  grid: (Cell | null)[][];
  width: number;
  height: number;
  playerPosition: [number, number];
  finishPosition: [number, number];
  placing?: boolean;
  onCellClick: (x: number, z: number, shiftKey: boolean) => void;
  onToggleTrigger: (x: number, z: number) => void;
  onCycleRight: (x: number, z: number) => void;
  onCycleDown: (x: number, z: number) => void;
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

  const handleCellContextMenu = (e: MouseEvent, x: number, z: number, cell: Cell | null) => {
    e.preventDefault();
    if (cell) onToggleTrigger(x, z);
  };

  return (
    <svg
      className={styles.grid + (placing ? " " + styles.placing : "")}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
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
        return (
          <g key={x + ":" + z}>
            <rect
              x={left}
              y={top}
              width={inner}
              height={inner}
              className={cell ? ((x + z) % 2 ? styles.cellOpen : styles.cellOpenModulu) : styles.cellNone}
              onClick={e => onCellClick(x, z, e.shiftKey)}
              onContextMenu={e => handleCellContextMenu(e, x, z, cell)}
            />
            {cell?.trigger && (
              <circle
                cx={left + inner / 2}
                cy={top + inner / 2}
                r={inner * 0.18}
                className={cell.trigger === 2 ? styles.triggerPushed : styles.trigger}
                pointerEvents="none"
              />
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
                  className={EDGE_STYLE[cell.right]}
                  onClick={() => onCycleRight(x, z)}
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
                  className={EDGE_STYLE[cell.down]}
                  onClick={() => onCycleDown(x, z)}
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
