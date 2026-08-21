import { loadDraft, saveDraft } from "@/levels/draft-storage";
import { Level } from "@/levels/level-schema";

import Level1 from "./level1.json";
import Level2 from "./level2.json";
import Level3 from "./level3.json";
import Level4 from "./level4.json";
import Level5 from "./level5.json";

const StaticLevels: Level[] = [
  //
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
] as Level[];

export const Levels: Level[] = [...StaticLevels];

let draftIndex: number | null = null;

const draft = loadDraft();
if (draft) {
  draftIndex = Levels.length;
  Levels.push(draft);
}

export function isDraftLevel(index: number): boolean {
  return draftIndex !== null && index === draftIndex;
}

/** Persists the given level as the draft, both to storage and into the live Levels array. */
export function syncDraft(level: Level): void {
  saveDraft(level);
  if (draftIndex === null) {
    draftIndex = Levels.length;
    Levels.push(level);
  } else {
    Levels[draftIndex] = level;
  }
}
