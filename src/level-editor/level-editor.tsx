import { Menu } from "@base-ui/react/menu";
import { Menubar } from "@base-ui/react/menubar";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  ChevronRight as ChevronRightIcon,
  Flag as FlagIcon,
  MouseLeftIcon,
  MouseRightIcon,
  Square as SquareIcon,
  User as UserIcon,
  Zap as ZapIcon,
} from "lucide-react";
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
  prevTriggerState,
  prevWallState,
  resizeLevel,
} from "@/levels/level-schema";
import { Levels, getDraftNumber, isDraftLevel, listDraftNumbers, nextDraftNumber, syncDraft } from "@/levels/levels";

import LevelEditorGrid from "./level-editor-grid";
import LevelEditorPreview from "./level-editor-preview";
import styles from "./level-editor.module.css";

const DEFAULT_WIDTH = 8;
const DEFAULT_HEIGHT = 8;

type EditorMode = "cell" | "trigger" | "player" | "finish";

const MODE_LEGEND: Record<EditorMode, string> = {
  cell: "Place/remove it",
  trigger: "Cycle trigger",
  player: "Set layer's player start",
  finish: "Set finish position",
};

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
  const [mode, setMode] = useState<EditorMode>("cell");
  const [draftsVersion, setDraftsVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const json = useMemo(() => JSON.stringify(level, null, 2), [level]);
  const draftNumbers = useMemo(() => listDraftNumbers(), [draftsVersion]);
  const nextDraft = useMemo(() => nextDraftNumber(), [draftsVersion]);

  const toggleExists = (layer: LayerName, x: number, z: number) =>
    setLevel(lvl => updateCell(lvl, layer, x, z, cell => (cell ? null : createCell())));
  const cycleTrigger = (layer: LayerName, x: number, z: number, backward: boolean) =>
    setLevel(lvl =>
      updateExistingCell(lvl, layer, x, z, cell => ({
        ...cell,
        trigger: (backward ? prevTriggerState : nextTriggerState)(cell.trigger),
      })),
    );
  const handleRightEdgeCycle = (layer: LayerName, x: number, z: number, backward: boolean) =>
    setLevel(lvl =>
      updateExistingCell(lvl, layer, x, z, cell => ({
        ...cell,
        right: (backward ? prevWallState : nextWallState)(cell.right),
      })),
    );
  const handleDownEdgeCycle = (layer: LayerName, x: number, z: number, backward: boolean) =>
    setLevel(lvl =>
      updateExistingCell(lvl, layer, x, z, cell => ({
        ...cell,
        down: (backward ? prevWallState : nextWallState)(cell.down),
      })),
    );

  const handleCellCycle = (layer: LayerName, x: number, z: number, backward: boolean) => {
    switch (mode) {
      case "finish":
        setLevel(lvl => setFinishPosition(lvl, x, z));
        break;
      case "player": {
        const layerIndex = LAYER_NAMES.indexOf(layer) as 0 | 1;
        setLevel(lvl => setPlayerPosition(lvl, layerIndex, x, z));
        break;
      }
      case "trigger":
        cycleTrigger(layer, x, z, backward);
        break;
      case "cell":
        toggleExists(layer, x, z);
        break;
    }
  };

  const applyResize = (width = widthInput, height = heightInput) => {
    const w = Math.max(1, Math.min(64, parseInt(width, 10) || level.width));
    const h = Math.max(1, Math.min(64, parseInt(height, 10) || level.height));
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

  const handleSaveAsDraft = (draftNumber: number) => {
    syncDraft(draftNumber, level);
    setDraftNumberInput(String(draftNumber));
    setDraftsVersion(v => v + 1);
  };

  const handleTryItOut = () => {
    const draftIndex = syncDraft(currentDraftNumber(), level);
    setDraftsVersion(v => v + 1);
    onTryItOut(draftIndex);
  };

  const handleLoadFrom = (index: number) => {
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
  const handleLoadClipboardClick = () => {
    try {
      const text = prompt("Paste the level JSON here");
      if (!text) return;
      const parsed = JSON.parse(text);
      if (!isValidLevel(parsed)) {
        setError("JSON does not match the Level schema.");
        return;
      }
      setLevel(parsed);
      setWidthInput(String(parsed.width));
      setHeightInput(String(parsed.height));
      setError(null);
    } catch (e) {
      setError("Could not parse JSON");
    }
  };

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
      <div className={styles.menubar}>
        <div className={styles.menubarGroup}>
          <button type="button" className={styles.button} onClick={onExit}>
            ← Back to Game
          </button>
          <button type="button" className={styles.button + " " + styles.active} onClick={handleTryItOut}>
            ▶ Try it out
          </button>
          <button type="button" className={styles.button} style={{ border: "1px solid #555" }} onClick={handleCopy}>
            Copy JSON
          </button>
        </div>

        <Menubar className={styles.menubarRoot}>
          <Menu.Root>
            <Menu.Trigger className={styles.menuTrigger}>Level</Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className={styles.menuPositioner} sideOffset={4}>
                <Menu.Popup className={styles.menuPopup}>
                  <Menu.Item className={styles.menuItem} onClick={handleNew}>
                    New
                  </Menu.Item>
                  <Menu.Separator className={styles.menuSeparator} />
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger className={styles.menuItem + " " + styles.submenuTrigger}>
                      Load from level
                      <ChevronRightIcon size={14} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner className={styles.menuPositioner} sideOffset={-4} alignOffset={-4}>
                        <Menu.Popup className={styles.menuPopup}>
                          {Levels.map((_, index) => (
                            <Menu.Item key={index} className={styles.menuItem} onClick={() => handleLoadFrom(index)}>
                              {isDraftLevel(index) ? `Draft ${getDraftNumber(index)}` : `Level ${index + 1}`}
                            </Menu.Item>
                          ))}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                  <Menu.Item className={styles.menuItem} onClick={handleLoadClick}>
                    Load from file
                  </Menu.Item>
                  <Menu.Item className={styles.menuItem} onClick={handleLoadClipboardClick}>
                    Load from clipboard
                  </Menu.Item>
                  <Menu.Separator className={styles.menuSeparator} />
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger className={styles.menuItem + " " + styles.submenuTrigger}>
                      Save as Draft
                      <ChevronRightIcon size={14} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner className={styles.menuPositioner} sideOffset={-4} alignOffset={-4}>
                        <Menu.Popup className={styles.menuPopup}>
                          {draftNumbers.map(draftNumber => (
                            <Menu.Item
                              key={draftNumber}
                              className={styles.menuItem}
                              onClick={() => handleSaveAsDraft(draftNumber)}
                            >
                              Draft {draftNumber}
                            </Menu.Item>
                          ))}
                          <Menu.Item className={styles.menuItem} onClick={() => handleSaveAsDraft(nextDraft)}>
                            Draft {nextDraft} (new)
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                  <Menu.Item className={styles.menuItem} onClick={handleCopy}>
                    Copy JSON
                  </Menu.Item>
                  <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
                  <Menu.Item className={styles.menuItem} onClick={handleDownload}>
                    Download file
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger className={styles.menuTrigger}>Tools</Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className={styles.menuPositioner} sideOffset={4}>
                <Menu.Popup className={styles.menuPopup}>
                  <Menu.Item className={styles.menuItem} onClick={() => handleCopyLayer("air", "ground")}>
                    Copy air → ground
                  </Menu.Item>
                  <Menu.Item className={styles.menuItem} onClick={() => handleCopyLayer("ground", "air")}>
                    Copy ground → air
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          <Menu.Separator className={styles.menuVSeparator} />

          <div className={styles.row}>
            <label className={styles.field}>
              W
              <input
                type="number"
                min={1}
                max={64}
                value={widthInput}
                onChange={e => {
                  setWidthInput(e.target.value);
                  applyResize(e.target.value);
                }}
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
                onChange={e => {
                  setHeightInput(e.target.value);
                  applyResize(undefined, e.target.value);
                }}
                className={styles.input}
              />
            </label>
          </div>
        </Menubar>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.body}>
        <Toolbar.Root className={styles.toolbar} orientation="vertical" aria-label="Edit mode">
          <ToggleGroup
            className={styles.toolbarGroup}
            value={[mode]}
            onValueChange={value => setMode((value[0] as EditorMode | undefined) ?? "cell")}
            aria-label="Edit mode"
          >
            <Toolbar.Button
              render={<Toggle />}
              value="cell"
              aria-label="Toggle cell"
              title="Toggle cell"
              className={styles.toolbarButton}
            >
              <SquareIcon size={18} />
            </Toolbar.Button>
            <Toolbar.Button
              render={<Toggle />}
              value="trigger"
              aria-label="Toggle trigger"
              title="Toggle trigger"
              className={styles.toolbarButton}
            >
              <ZapIcon size={18} />
            </Toolbar.Button>
            <Toolbar.Button
              render={<Toggle />}
              value="player"
              aria-label="Set player"
              title="Set player"
              className={styles.toolbarButton}
            >
              <UserIcon size={18} />
            </Toolbar.Button>
            <Toolbar.Button
              render={<Toggle />}
              value="finish"
              aria-label="Set finish"
              title="Set finish"
              className={styles.toolbarButton}
            >
              <FlagIcon size={18} />
            </Toolbar.Button>
          </ToggleGroup>
        </Toolbar.Root>

        <div className={styles.mainArea}>
          <div className={styles.legend}>
            CELL
            <br />
            <MouseLeftIcon />: {MODE_LEGEND[mode]}
            <br />
            <br />
            EDGE
            <br />
            <MouseLeftIcon />: Cycle wall
            <br />
            <MouseRightIcon />: Cycle backward
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
                    crosshair={mode !== "cell"}
                    onCellCycle={(x, y, backward) => handleCellCycle(layerName, x, y, backward)}
                    onRightEdgeCycle={(x, y, backward) => handleRightEdgeCycle(layerName, x, y, backward)}
                    onDownEdgeCycle={(x, y, backward) => handleDownEdgeCycle(layerName, x, y, backward)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <LevelEditorPreview level={level} />
      </div>
    </div>
  );
}
