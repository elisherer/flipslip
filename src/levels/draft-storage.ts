import { Level } from "@/levels/level-schema";

const DRAFT_KEY = "draft";

export function loadDraft(): Level | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Level) : null;
  } catch {
    return null;
  }
}

export function saveDraft(level: Level): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(level));
  } catch {
    // storage unavailable (quota, privacy mode, etc.) -- draft just won't persist
  }
}
