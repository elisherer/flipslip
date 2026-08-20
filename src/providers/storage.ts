import { Settings } from "@/types/game-state";
import { ProgressState } from "@/types/progress-state";
import { isLocalDev } from "@/utils/constants";
import JSONGzip from "@/utils/json-gzip";

const PROGRESS_STORAGE_KEY = isLocalDev ? "portango_progress" : "progress";
const SETTINGS_STORAGE_KEY = isLocalDev ? "portango_settings" : "settings";
const GZIP_MARKER = "gzip,";

class Storage {
  public static async saveProgress(progress: ProgressState) {
    const compressed = await JSONGzip.compress(progress);
    localStorage.setItem(PROGRESS_STORAGE_KEY, GZIP_MARKER + compressed);

    return;
  }
  public static async loadProgress(): Promise<ProgressState | undefined> {
    const serializedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (serializedProgress && serializedProgress.startsWith(GZIP_MARKER)) {
      return JSONGzip.decompress(serializedProgress.substring(GZIP_MARKER.length));
    }
  }

  public static saveSettings(settings: Settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
  public static loadSettings(defaults: Settings) {
    const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (serializedSettings) {
      const x = JSON.parse(serializedSettings);
      return {
        ...defaults,
        ...x,
      };
    }
    return defaults;
  }
}

if (isLocalDev) {
  (window as any).sofsof = {
    JSONGzip,
    Storage,
    cheat: (level: number) => {
      Storage.saveProgress({
        lastCompletedIndex: level,
      });
    },
  };
}

export default Storage;
