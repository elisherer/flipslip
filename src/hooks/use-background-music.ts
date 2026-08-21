import { useEffect } from "react";
import useSound from "use-sound";

import { useGameState } from "../providers/game-state-provider";

type SecondArg<F> = F extends (a: any, b: infer T, ...args: any[]) => any ? T : never;
type UseSoundOptions = SecondArg<typeof useSound>;

export default function useBackgroundMusic(path: string, options?: UseSoundOptions) {
  const [{ audioLocked, windowHasFocus, settings }] = useGameState();
  const [play, { stop }] = useSound(path, {
    soundEnabled: !audioLocked && settings.music,
    interrupt: true,
    loop: true,
    volume: 0.2,
    ...options,
  });
  useEffect(() => {
    if (!settings.music || !windowHasFocus) return;
    play({ forceSoundEnabled: true });
    return stop;
  }, [play, stop, settings.music, windowHasFocus]);
}
