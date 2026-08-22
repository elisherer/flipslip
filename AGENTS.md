# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## What this is

**Portango** is a 3D co-op puzzle game built with React + Three.js (via
`@react-three/fiber`/`drei`). Two players share one keyboard: an astronaut
walking on a "ground" layer (WASD) and a UFO flying on an "air" layer (arrow
keys). Levels are grids where each layer has independent walls; the two
players must coordinate — hit toggle switches, navigate around colored gates,
and both reach the finish tile — to complete a level.

Stack: React 19, TypeScript, Vite, `@react-three/fiber`/`drei`/postprocessing,
`three`, Immer-backed context state (`use-immer-state-provider`), CSS Modules
for UI chrome. No test framework is wired up yet (`npm test` is a stub).

## Running things

```
npm start          # vite dev server, opens the browser
npm run build       # tsc -b && vite build
npm run lint         # eslint over src/**/*.{js,jsx,ts,tsx}
npm run format       # prettier --write over src (ts/tsx/css/scss)
```

There's a `isLocalDev` flag (`src/utils/constants.ts`, true on `localhost` or
with a `#debug` URL hash) that gates dev-only UI: the debug HUD button, the
level-editor entry point, and a `window.P` cheat console (`Storage`,
`JSONGzip`, `P.cheat(levelIndex)` to jump progress).

## Architecture

### State: three Immer-backed context providers

All app state lives in three independent providers built with
`createImmerStateContext` / `useImmerStateProvider` from
`use-immer-state-provider`. Each exposes `[state, api]` via a `useXState()`
hook; actions are plain `(draft, ...args) => void` reducers that mutate an
Immer draft directly. **Follow this pattern for any new piece of shared
state** — don't reach for `useState`/prop-drilling for anything more than one
component deep, and don't introduce a different state library.

- `game-state-provider.tsx` — cross-session-ish stuff: settings, audio-lock,
  which level index is active, `inLevel`, unlocked-progress. Persisted via
  `providers/storage.ts` (progress is gzip+base64'd through
  `utils/json-gzip.ts`; settings are plain JSON).
- `level-state-provider.tsx` — the live state of *whichever level is
  currently playing*: both players' positions/directions, the shared
  `toggled` bit, `completed`. Re-initializes from `Levels[levelIndex]`
  whenever `levelIndex`/`invalidationFlag` change. Also owns `canEnterCell`
  (the single source of truth for movement legality — see below).
- `scene-provider.tsx` — small, holds the `CameraControls` ref so components
  outside the R3F tree can drive the camera.

### Level data model (`src/levels/level-schema.ts`)

Levels are plain JSON (`src/levels/level*.json`), typed as `Level`. This is
the schema to know cold before touching anything level-related:

```ts
interface Cell {
  right: WallState;   // passability to the cell at x+1 — 0 open, 1 wall, 2 green, 3 purple
  down: WallState;    // passability to the cell at y+1
  trigger?: TriggerState; // 1 = starts unpushed, 2 = starts pushed; absent = no trigger
}
interface Level {
  width: number; height: number;
  layers: { ground: (Cell | null)[][]; air: (Cell | null)[][] };
  players: [PlayerStart, PlayerStart]; // player 0 -> ground, player 1 -> air
  finish: { position: [x, y] };        // single shared finish, same coords in both layers
  initialState: { green: boolean; purple: boolean };
}
```

Key ideas, all deliberate — don't relitigate them without a reason:

- **Edge-based walls, not cell-typed walls.** A wall is a property of the
  boundary between two cells (`right`/`down`), not a "this cell is solid"
  flag. `null` in the grid means "no cell here", which *also* acts as a wall
  against any real neighbor — you don't need to double-encode a boundary.
- **Two independent layers, one player each.** `ground` and `air` are
  separate grids; a wall in one doesn't imply anything about the other.
  `LAYER_NAMES = ["ground", "air"]` and player index maps 1:1 to layer index.
- **A single shared `toggled` bit drives everything conditional.** Colored
  walls (`WallState` 2/3) are open when `toggled === initialState.green`
  (or `.purple`). Triggers work the same way, generalized:
  `isTriggerPushed(trigger, toggled) = (trigger === 2) !== toggled`. Pushing
  a trigger only flips `toggled` if that trigger is *currently unpushed*
  (`level-state-provider.tsx`'s `arriveAt`) — flipping the one shared bit
  inverts every trigger's derived pushed state simultaneously by
  construction. There is no per-trigger runtime state; it's all derived.
  If you add another "conditional" mechanic, prefer deriving it from
  `toggled` + some static per-cell value the same way, rather than adding
  new runtime state to `LevelState`.
- Player run-time position is a 3-tuple `[x, y, z]` (`y` always `0`) even
  though the schema's `PlayerStart.position` is 2D `[x, y]` — `y` here means
  "grid row", not height. `level-state-provider.tsx`'s `initialize` does the
  `[x, y] -> [x, 0, y]` expansion. Don't conflate the two `y`s.

`level-schema.ts` also exports the mutation helpers used by the editor
(`createLevel`, `resizeLevel`, `nextWallState`, `nextTriggerState`,
`isValidLevel`) — reuse these rather than hand-rolling grid mutation logic.

### Levels list, drafts (`src/levels/levels.ts`, `draft-storage.ts`)

`Levels: Level[]` is the canonical, *mutable* array everything reads from —
the numbered `level1.json..levelN.json` files, plus any locally-saved drafts
appended after them. Drafts live in `localStorage["drafts"]`
(`Record<draftNumber, Level>`) and are pushed onto the live `Levels` array at
module-load time; `syncDraft(draftNumber, level)` updates both storage and
the in-memory array in one call, returning the array index. `getDraftNumber`/
`isDraftLevel`/`nextDraftNumber` let UI code (the carousel, the editor) treat
drafts as first-class, labeled entries ("Draft 3") without needing to know
storage details. If you extend the draft system, keep `Levels` a stable
array reference — code elsewhere just reads `Levels.length`/`Levels[i]`.

### Rendering (`src/levels/level-renderer.tsx`, `player.tsx`)

`LevelRenderer` walks every `(x, z)` cell of both layers once per render
(memoized on `[level, toggled, debug]`) and emits `KitModel`s for floor
tiles, wall pieces, trigger buttons, and the finish portal, plus raw
`<mesh>`/`boxGeometry` for colored (toggle) walls. Wall pieces come from the
`prototype` kit (`wall-low`/`wall` models) — currently rendered per-layer;
if you change how/when walls merge across layers, keep the neighbor-lookup
logic (`level.layers[layerName][z]?.[x±1]`) as the one place that decides
"is there a wall here", so passability (`canEnterCell`) and visuals can't
drift apart. `Player` (`levels/player.tsx`) owns movement/interpolation for
both player indices and calls into `level-state-provider`'s `moveTo`/
`arriveAt`/`canEnterCell` — it does not duplicate any wall/trigger logic
itself.

### Assets: kits and `KitModel` (`src/assets/kit.ts`, `components/kit-model.tsx`)

3D assets are organized into **kits** under `public/assets/kits/<kit>/`
(currently `prototype`, `td`, `characters`). `KitModelSpec` (`kit`, `model`,
optional `variant`) is the typed way to reference one; `KitModel` is the R3F
component that resolves a spec to a loaded glTF/GLB, applies variant/color
overrides, and clones skinned meshes per-instance (see the comment in that
file — sharing a skeleton across two mounted instances breaks static-pose
freezing on unmount, so don't remove the clone). When adding new assets, add
them under the right kit folder and reference them by `{kit, model}`; don't
hardcode asset paths outside `KitModel`.

### Level Editor (`src/level-editor/`)

A dev-only (`isLocalDev`-gated) in-browser level editor: two side-by-side
SVG grids (ground/air) you click to edit, a sidebar of controls, and a
"Try it out" button that saves the current edit as a numbered draft and
jumps straight into playing it. Entry point is `App`
(`src/app.tsx`) toggling between the normal game tree and
`<LevelEditor>`; opening it *from inside a level* auto-loads that level's
JSON (and, if that level is itself a draft, prefills the draft-number box so
saving overwrites it instead of creating a new one). The editor operates on
plain `Level` objects using the same `level-schema.ts` helpers as everywhere
else — it has no separate/parallel data model.

If you touch the editor, keep interaction semantics consistent with the
legend text it already displays (click/shift-click/right-click/edge-click
each do one specific thing) rather than adding new modifier-key
combinations — there are already four.

## Code style

- **Formatting is Prettier-enforced, not a matter of taste.** 120-col print
  width, double quotes are not enforced but the codebase is consistently
  double-quote, trailing commas everywhere, `arrowParens: "avoid"`. Imports
  are auto-sorted into three groups by
  `@trivago/prettier-plugin-sort-imports`: external packages, then `@/*`
  absolute imports, then relative `./`/`../` imports, each group separated
  by a blank line, specifiers alphabetized. Run `npm run format` rather than
  hand-arranging imports.
- **Path alias `@/*` maps to `src/*`** (see `tsconfig.app.json`). Prefer it
  over long relative chains for anything outside the current directory;
  relative imports (`./foo`) are fine for same-folder siblings.
- **Components**: function components, default-exported, PascalCase
  filenames for components that are the primary export of their file when
  they're "screens/complex" (`Modal.tsx`, `AboutModal.tsx`), kebab-case
  filenames elsewhere (`kit-model.tsx`, `level-renderer.tsx`) — follow
  whatever the neighboring files in that folder already do.
- **CSS Modules** (`*.module.css`) for anything with real layout/visual
  design (HUD, modals, level editor). Inline Three.js props
  (`position`/`rotation`/`scale`) for 3D scene composition — there is no CSS
  for the 3D scene itself.
- **State reducers** (the `actions` objects passed to
  `createImmerStateContext`) mutate the Immer `draft` directly and return
  nothing; keep new actions in that shape rather than returning new state.
- Per this repo's standing instructions: default to **no comments**; only
  add one where the *why* isn't obvious from the code (a non-obvious
  invariant, a workaround, something that would surprise a future reader).
  Don't add comments describing *what* well-named code already says.
- Don't add new abstractions/config layers for a one-off need — this
  codebase favors small, direct, colocated code (see how small each
  provider/component is) over generic frameworks-within-the-framework.

## Testing changes

There is no automated test suite (`npm test` is a placeholder) and no CI
gate beyond `tsc -b`/`eslint` if you choose to run them. In practice,
verifying a change to gameplay/rendering means **actually running the dev
server and looking at it** — `npm start`, or drive it headlessly with
Playwright (this repo has no Playwright dependency installed; if you need it
ad hoc, resolve it from wherever your environment already has it cached
rather than adding it as a project dependency) and screenshot the result.
Trust visual/behavioral verification over "it typechecks" for anything
touching movement, wall passability, or rendering — several bugs in this
codebase's history were only caught by actually loading the page (e.g. a
`meshBasicMaterial` silently ignoring `receiveShadow`, or a retargeted
animation's rest-pose vs. keyframe-pose mismatch that no type system could
have caught).

Always run `npx tsc -b --noEmit` after non-trivial changes — this project's
`tsconfig.app.json` has `strict`, `noUnusedLocals`, and `noUnusedParameters`
on, so it catches real mistakes, not just style nits.

## Known rough edges (don't be surprised by these; fix opportunistically, not proactively)

- `eslint.config.js` is a flat-config file but its single entry uses
  legacy-config keys (`root`/`env`/`extends`) inside it, so `npm run lint`
  currently reports "file ignored, no matching configuration" for
  everything. Pre-existing; not a regression you introduced.
- `src/components/starts.tsx` (a starfield background) has had lingering
  type errors in the past unrelated to level/gameplay work — check `tsc -b`
  output attributes an error there before assuming your change caused it.
- The finish-detection code compares grid coordinates directly now (fixed
  during the schema migration); if you see old references to comparing
  `position[1]` between players for a finish check, that was a bug in the
  pre-migration code — don't reintroduce that pattern.

## Where to look first for common tasks

- **New level content** → author it in the in-browser editor
  (`isLocalDev`, pencil icon in the HUD), then "Download"/"Copy JSON" into
  `src/levels/levelN.json` and add it to the `StaticLevels` array in
  `levels.ts`.
- **New wall/trigger behavior** → `level-schema.ts` (types + pure derive
  functions) first, then `level-state-provider.tsx` (`canEnterCell`/
  `arriveAt`) for mechanics, then `level-renderer.tsx` for visuals. Keep
  that order — mechanics should never read from rendering code.
- **New 3D asset/kit piece** → drop it under `public/assets/kits/<kit>/`,
  reference via `KitModel` with a `{kit, model}` spec.
- **New persistent setting/progress field** → `game-state-provider.tsx` +
  `types/game-state.ts`, persisted through `providers/storage.ts`.
