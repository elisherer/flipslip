import { loadDrafts, removeDraft, saveDraft } from "@/levels/draft-storage";
import { Level } from "@/levels/level-schema";

import Level1 from "./level1.json";
import Level2 from "./level2.json";
import Level3 from "./level3.json";
import Level4 from "./level4.json";
import Level5 from "./level5.json";
import Level6 from "./level6.json";

const StaticLevels: Level[] = [
  //
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
] as Level[];

export const Levels: Level[] = [...StaticLevels];

// draft number -> index within Levels
const draftIndexByNumber = new Map<number, number>();

Object.entries(loadDrafts())
  .map(([num, level]) => [Number(num), level] as const)
  .sort(([a], [b]) => a - b)
  .forEach(([draftNumber, level]) => {
    draftIndexByNumber.set(draftNumber, Levels.length);
    Levels.push(level);
  });

/** The draft number for a Levels index, or null if it isn't a draft. */
export function getDraftNumber(levelIndex: number): number | null {
  for (const [draftNumber, index] of draftIndexByNumber) {
    if (index === levelIndex) return draftNumber;
  }
  return null;
}

export function isDraftLevel(index: number): boolean {
  return getDraftNumber(index) !== null;
}

/** The lowest draft number not already in use, for defaulting a new draft's slot. */
export function nextDraftNumber(): number {
  const used = [...draftIndexByNumber.keys()];
  return used.length ? Math.max(...used) + 1 : 1;
}

/** Persists the given level as draft `draftNumber`, both to storage and into the live Levels array. Returns its index. */
export function syncDraft(draftNumber: number, level: Level): number {
  saveDraft(draftNumber, level);
  let index = draftIndexByNumber.get(draftNumber);
  if (index === undefined) {
    index = Levels.length;
    Levels.push(level);
    draftIndexByNumber.set(draftNumber, index);
  } else {
    Levels[index] = level;
  }
  return index;
}

/** Removes a draft from storage and from the live Levels array, shifting later drafts' indices down. */
export function deleteDraft(draftNumber: number): void {
  const index = draftIndexByNumber.get(draftNumber);
  if (index === undefined) return;
  removeDraft(draftNumber);
  Levels.splice(index, 1);
  draftIndexByNumber.delete(draftNumber);
  for (const [num, idx] of draftIndexByNumber) {
    if (idx > index) draftIndexByNumber.set(num, idx - 1);
  }
}
