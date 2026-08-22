import { MouseEvent, useMemo } from "react";

import { Cell, InitialToggleState, WallState } from "@/levels/level-schema";

import styles from "./level-editor-grid.module.css";

const CELL_SIZE = 40;
const WALL_THICKNESS = 5;
const EDGE_HIT = 10;

const EDGE_STYLE: Record<WallState, string> = {
  0: styles.edgeOpen,
  1: styles.edgeWall,
  2: styles.edgeGreen,
  3: styles.edgePurple,
};

function isUntoggledColorWall(state: WallState, initialState: InitialToggleState): boolean {
  if (state === 2) return !initialState.green;
  if (state === 3) return !initialState.purple;
  return false;
}

export default function LevelEditorGrid({
  grid,
  width,
  height,
  playerPosition,
  finishPosition,
  initialState,
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
  initialState: InitialToggleState;
  placing?: boolean;
  onCellClick: (x: number, y: number, shiftKey: boolean) => void;
  onToggleTrigger: (x: number, y: number) => void;
  onCycleRight: (x: number, y: number) => void;
  onCycleDown: (x: number, y: number) => void;
}) {
  const svgWidth = width * CELL_SIZE + WALL_THICKNESS;
  const svgHeight = height * CELL_SIZE + WALL_THICKNESS;

  const cells = useMemo(() => {
    const items: { x: number; y: number; cell: Cell | null }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        items.push({ x, y, cell: grid[y]?.[x] ?? null });
      }
    }
    return items;
  }, [grid, width, height]);

  const cellCenter = (x: number, y: number) => {
    const left = x * CELL_SIZE + WALL_THICKNESS / 2;
    const top = y * CELL_SIZE + WALL_THICKNESS / 2;
    const inner = CELL_SIZE - WALL_THICKNESS;
    return [left + inner / 2, top + inner / 2] as const;
  };

  const handleCellContextMenu = (e: MouseEvent, x: number, y: number, cell: Cell | null) => {
    e.preventDefault();
    if (cell) onToggleTrigger(x, y);
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
      {cells.map(({ x, y, cell }) => {
        const left = x * CELL_SIZE + WALL_THICKNESS / 2;
        const top = y * CELL_SIZE + WALL_THICKNESS / 2;
        const inner = CELL_SIZE - WALL_THICKNESS;
        return (
          <g key={x + ":" + y}>
            <rect
              x={left}
              y={top}
              width={inner}
              height={inner}
              className={cell ? ((x + y) % 2 ? styles.cellOpen : styles.cellOpenModulu) : styles.cellNone}
              onClick={e => onCellClick(x, y, e.shiftKey)}
              onContextMenu={e => handleCellContextMenu(e, x, y, cell)}
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
      {cells.map(({ x, y, cell }) => {
        if (!cell) return null;
        const left = x * CELL_SIZE + WALL_THICKNESS / 2;
        const top = y * CELL_SIZE + WALL_THICKNESS / 2;
        const inner = CELL_SIZE - WALL_THICKNESS;
        return (
          <g key={"edges:" + x + ":" + y}>
            {x < width - 1 && (
              <>
                <rect
                  x={left + inner - EDGE_HIT / 2}
                  y={top}
                  width={EDGE_HIT}
                  height={inner}
                  className={EDGE_STYLE[cell.right]}
                  onClick={() => onCycleRight(x, y)}
                />
                {isUntoggledColorWall(cell.right, initialState) && (
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
            {y < height - 1 && (
              <>
                <rect
                  x={left}
                  y={top + inner - EDGE_HIT / 2}
                  width={inner}
                  height={EDGE_HIT}
                  className={EDGE_STYLE[cell.down]}
                  onClick={() => onCycleDown(x, y)}
                />
                {isUntoggledColorWall(cell.down, initialState) && (
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
      {(() => {
        const [px, py] = cellCenter(...playerPosition);
        return (
          <g pointerEvents="none">
            <circle cx={px} cy={py} r={CELL_SIZE * 0.28} className={styles.player} />
            <text x={px} y={py} className={styles.markerLabel}>
              P
            </text>
          </g>
        );
      })()}
      {(() => {
        const [fx, fy] = cellCenter(...finishPosition);
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
      })()}
    </svg>
  );
}
