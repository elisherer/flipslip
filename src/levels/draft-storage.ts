import { Level } from "@/levels/level-schema";

const DRAFTS_KEY = "drafts";
const LEGACY_DRAFT_KEY = "draft";

export function loadDrafts(): Record<number, Level> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const drafts: Record<number, Level> = raw ? JSON.parse(raw) : {};

    // one-time migration from the old single-draft key
    const legacy = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (legacy) {
      if (!(1 in drafts)) drafts[1] = JSON.parse(legacy);
      localStorage.removeItem(LEGACY_DRAFT_KEY);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    }

    return drafts && typeof drafts === "object" ? drafts : {};
  } catch {
    return {};
  }
}

export function saveDraft(draftNumber: number, level: Level): void {
  try {
    const drafts = loadDrafts();
    drafts[draftNumber] = level;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // storage unavailable (quota, privacy mode, etc.) -- draft just won't persist
  }
}

export function removeDraft(draftNumber: number): void {
  try {
    const drafts = loadDrafts();
    delete drafts[draftNumber];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // storage unavailable -- nothing to clean up
  }
}
