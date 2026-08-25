import { ChangeEvent, useMemo, useRef, useState } from "react";

import {
  Cell,
  LAYER_NAMES,
  LayerName,
  Level,
  createCell,
  createLevel,
  isValidLevel,
  nextTriggerState,
  nextWallState,
  resizeLevel,
} from "@/levels/level-schema";
import { Levels, getDraftNumber, isDraftLevel, nextDraftNumber, syncDraft } from "@/levels/levels";

import LevelEditorGrid from "./level-editor-grid";
import LevelEditorPreview from "./level-editor-preview";
import styles from "./level-editor.module.css";

const DEFAULT_WIDTH = 8;
const DEFAULT_HEIGHT = 8;

function updateCell(
  level: Level,
  layer: LayerName,
  x: number,
  y: number,
  update: (cell: Cell | null) => Cell | null,
): Level {
  const grid = level.layers[layer];
  const row = grid[y];
  const nextRow = row.slice();
  nextRow[x] = update(row[x] ?? null);
  const nextGrid = grid.slice();
  nextGrid[y] = nextRow;
  return { ...level, layers: { ...level.layers, [layer]: nextGrid } };
}

function updateExistingCell(level: Level, layer: LayerName, x: number, z: number, update: (cell: Cell) => Cell): Level {
  return updateCell(level, layer, x, z, cell => (cell ? update(cell) : cell));
}

function copyLayer(level: Level, from: LayerName, to: LayerName): Level {
  const grid = level.layers[from].map(row => row.map(cell => (cell ? { ...cell } : null)));
  return { ...level, layers: { ...level.layers, [to]: grid } };
}

function setPlayerPosition(level: Level, layerIndex: 0 | 1, x: number, z: number): Level {
  const players: Level["players"] = [...level.players];
  players[layerIndex] = { position: [x, z] };
  return { ...level, players };
}

function setFinishPosition(level: Level, x: number, y: number): Level {
  return { ...level, finish: { position: [x, y] } };
}

function initialLevel(levelIndex?: number): Level {
  const source = levelIndex !== undefined ? Levels[levelIndex] : undefined;
  return source ? (JSON.parse(JSON.stringify(source)) as Level) : createLevel(DEFAULT_WIDTH, DEFAULT_HEIGHT);
}

export default function LevelEditor({
  onExit,
  onTryItOut,
  initialLevelIndex,
}: {
  onExit: () => void;
  onTryItOut: (levelIndex: number) => void;
  initialLevelIndex?: number;
}) {
  const [level, setLevel] = useState<Level>(() => initialLevel(initialLevelIndex));
  const [widthInput, setWidthInput] = useState(String(level.width));
  const [heightInput, setHeightInput] = useState(String(level.height));
  const [draftNumberInput, setDraftNumberInput] = useState(() => {
    const draftNumber = initialLevelIndex !== undefined ? getDraftNumber(initialLevelIndex) : null;
    return String(draftNumber ?? nextDraftNumber());
  });
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState<"player" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const json = useMemo(() => JSON.stringify(level, null, 2), [level]);

  const toggleExists = (layer: LayerName, x: number, z: number) =>
    setLevel(lvl => updateCell(lvl, layer, x, z, cell => (cell ? null : createCell())));
  const cycleTrigger = (layer: LayerName, x: number, z: number) =>
    setLevel(lvl =>
      updateExistingCell(lvl, layer, x, z, cell => ({ ...cell, trigger: nextTriggerState(cell.trigger) })),
    );
  const cycleRight = (layer: LayerName, x: number, z: number) =>
    setLevel(lvl => updateExistingCell(lvl, layer, x, z, cell => ({ ...cell, right: nextWallState(cell.right) })));
  const cycleDown = (layer: LayerName, x: number, z: number) =>
    setLevel(lvl => updateExistingCell(lvl, layer, x, z, cell => ({ ...cell, down: nextWallState(cell.down) })));

  const handleCellClick = (layer: LayerName, x: number, z: number, shiftKey: boolean) => {
    if (shiftKey) {
      setLevel(lvl => setFinishPosition(lvl, x, z));
    } else if (placing === "player") {
      const layerIndex = LAYER_NAMES.indexOf(layer) as 0 | 1;
      setLevel(lvl => setPlayerPosition(lvl, layerIndex, x, z));
      setPlacing(null);
    } else {
      toggleExists(layer, x, z);
    }
  };

  const applyResize = () => {
    const w = Math.max(1, Math.min(64, parseInt(widthInput, 10) || level.width));
    const h = Math.max(1, Math.min(64, parseInt(heightInput, 10) || level.height));
    setLevel(lvl => resizeLevel(lvl, w, h));
    setWidthInput(String(w));
    setHeightInput(String(h));
  };

  const handleNew = () => {
    const w = Math.max(1, Math.min(64, parseInt(widthInput, 10) || DEFAULT_WIDTH));
    const h = Math.max(1, Math.min(64, parseInt(heightInput, 10) || DEFAULT_HEIGHT));
    setLevel(createLevel(w, h));
    setWidthInput(String(w));
    setHeightInput(String(h));
    setError(null);
  };

  const handleCopyLayer = (from: LayerName, to: LayerName) => setLevel(lvl => copyLayer(lvl, from, to));

  const handleCopy = () => {
    navigator.clipboard?.writeText(json).catch(() => {});
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "level.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentDraftNumber = () => Math.max(1, parseInt(draftNumberInput, 10) || nextDraftNumber());

  const handleSaveAsDraft = () => {
    syncDraft(currentDraftNumber(), level);
  };

  const handleTryItOut = () => {
    const draftIndex = syncDraft(currentDraftNumber(), level);
    onTryItOut(draftIndex);
  };

  const handleLoadFromLevels = (e: ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    e.target.value = "";
    if (Number.isNaN(index) || !Levels[index]) return;
    const loaded = initialLevel(index);
    setLevel(loaded);
    setWidthInput(String(loaded.width));
    setHeightInput(String(loaded.height));
    const draftNumber = getDraftNumber(index);
    if (draftNumber !== null) setDraftNumberInput(String(draftNumber));
    setError(null);
  };

  const handleLoadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file
      .text()
      .then(text => {
        const parsed = JSON.parse(text);
        if (!isValidLevel(parsed)) {
          setError("File does not match the Level schema.");
          return;
        }
        setLevel(parsed);
        setWidthInput(String(parsed.width));
        setHeightInput(String(parsed.height));
        setError(null);
      })
      .catch(() => setError("Could not parse JSON file."));
  };

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarGroup}>
          <button type="button" className={styles.button} onClick={onExit}>
            ← Back to Game
          </button>
          <button type="button" className={styles.button + " " + styles.active} onClick={handleTryItOut}>
            ▶ Try it out
          </button>
          <button type="button" className={styles.button} onClick={handleCopy}>
            Copy JSON
          </button>
        </div>

        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarRow}>
            <input
              type="number"
              min={1}
              value={draftNumberInput}
              onChange={e => setDraftNumberInput(e.target.value)}
              className={styles.input}
              title="Draft number"
            />
            <button type="button" className={styles.button} onClick={handleSaveAsDraft}>
              Save as Draft
            </button>
          </div>
        </div>

        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarRow}>
            <label className={styles.field}>
              W
              <input
                type="number"
                min={1}
                max={64}
                value={widthInput}
                onChange={e => setWidthInput(e.target.value)}
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              H
              <input
                type="number"
                min={1}
                max={64}
                value={heightInput}
                onChange={e => setHeightInput(e.target.value)}
                className={styles.input}
              />
            </label>
          </div>
          <div className={styles.sidebarRow}>
            <button type="button" className={styles.button} onClick={applyResize}>
              Resize
            </button>
            <button type="button" className={styles.button} onClick={handleNew}>
              New
            </button>
          </div>
        </div>

        <div className={styles.sidebarGroup}>
          <button type="button" className={styles.button} onClick={() => handleCopyLayer("air", "ground")}>
            Copy air → ground
          </button>
          <button type="button" className={styles.button} onClick={() => handleCopyLayer("ground", "air")}>
            Copy ground → air
          </button>
        </div>

        <div className={styles.sidebarGroup}>
          <button
            type="button"
            className={styles.button + " " + (placing === "player" ? styles.active : "")}
            onClick={() => setPlacing(p => (p === "player" ? null : "player"))}
          >
            Place Player
          </button>
        </div>

        <div className={styles.sidebarGroup}>
          <label className={styles.field}>
            Load from
            <select className={styles.select} defaultValue="" onChange={handleLoadFromLevels}>
              <option value="" disabled>
                Select level…
              </option>
              {Levels.map((_, index) => (
                <option key={index} value={index}>
                  {isDraftLevel(index) ? `Draft ${getDraftNumber(index)}` : `Level ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.button} onClick={handleLoadClick}>
            Load JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
          <button type="button" className={styles.button} onClick={handleDownload}>
            Download
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>
      <div className={styles.mainArea}>
        <div className={styles.legend}>
          {placing
            ? "Click a cell (in either layer) to place its player…"
            : "Click: place/remove cell\nShift+Click: set finish\nRight-click: cycle trigger (none → unpushed → pushed)\nClick edge: cycle wall (open → wall → green open → green closed → purple open → purple closed)"}
        </div>
        <div className={styles.gridPane}>
          {LAYER_NAMES.map(layerName => {
            const layerIndex = LAYER_NAMES.indexOf(layerName) as 0 | 1;
            return (
              <div key={layerName} className={styles.layerBlock}>
                <div className={styles.layerLabel}>{layerName}</div>
                <LevelEditorGrid
                  grid={level.layers[layerName]}
                  width={level.width}
                  height={level.height}
                  playerPosition={level.players[layerIndex].position}
                  finishPosition={level.finish.position}
                  placing={placing !== null}
                  onCellClick={(x, y, shiftKey) => handleCellClick(layerName, x, y, shiftKey)}
                  onToggleTrigger={(x, y) => cycleTrigger(layerName, x, y)}
                  onCycleRight={(x, y) => cycleRight(layerName, x, y)}
                  onCycleDown={(x, y) => cycleDown(layerName, x, y)}
                />
              </div>
            );
          })}
        </div>
      </div>
      <LevelEditorPreview level={level} />
    </div>
  );
}
