import { Cell, CellType, LevelDefinition, Tile, ToggleId } from "@/levels/level-definition";
import TileMaps from "@/levels/tile-maps";

type ShortenTile = number | Tile;

const CellAbbr = {
  // Empty cell
  " ": { type: CellType.EMPTY },
  // Wall
  X: { type: CellType.WALL },
  // Toggle Wall B
  B: { type: CellType.TOGGLE_WALL, toggle_id: ToggleId.BLUE },
  // Toggle Wall R
  R: { type: CellType.TOGGLE_WALL, toggle_id: ToggleId.RED },
  // Finish
  F: { type: CellType.FINISH },
  // Toggle
  T: { type: CellType.TOGGLE },
} satisfies Record<string, Cell>;
type AllowedChars = keyof typeof CellAbbr;
type ValidateString<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends AllowedChars
    ? `${First}${ValidateString<Rest>}`
    : never // Fails if a character is not allowed
  : ""; // Base case for empty string
export function row<S extends string>(value: S & (ValidateString<S> extends never ? never : S)): S {
  return value;
}

const ROTATIONS: Record<number, number> = {
  0: 0,
  1: Math.PI / 2,
  2: Math.PI,
  3: (Math.PI * 3) / 2,
};

type ShortenDefinition = Omit<LevelDefinition, "layers" | "tiles"> & {
  layers: string[][];
  tiles: ShortenTile[][][];
};

function extractRow(input: string): Cell[] {
  const result: Cell[] = [];
  for (let i = 0; i < input.length; i++) {
    result.push(CellAbbr[input[i] as keyof typeof CellAbbr]);
  }
  return result;
}

function extractTile(input: ShortenTile): Tile | Tile[] {
  if (typeof input === "number") {
    if (input < 1000 || input > 9999) {
      console.warn("Tile input is out of range: " + input);
    }
    const tileIndex = Math.floor(input / 10);
    const rotationIndex = input % 10;
    const def = TileMaps.prototype[tileIndex];
    if (!def) {
      console.warn("No tile found for index: " + tileIndex);
    }
    const defs = Array.isArray(def) ? def : [def];
    const result = defs.map(
      def =>
        ({
          kit: "prototype",
          model: typeof def === "string" ? def : (def?.model ?? "_not_found_"),
          correction: typeof def !== "string" ? def?.correction : undefined,
          rotation: [0, ROTATIONS[rotationIndex], 0],
        }) as Tile,
    );
    return result.length === 1 ? result[0] : result;
  }
  return input;
}

export function levelFrom(l: ShortenDefinition): LevelDefinition {
  return {
    ...l,
    layers: l.layers.map(l => l.map(extractRow)),
    tiles: l.tiles.map(l => l.map(row => row.map(extractTile))),
  };
}
