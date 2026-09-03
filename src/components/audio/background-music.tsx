import { Howler } from "howler";
import { useEffect } from "react";
import useSound from "use-sound";

import { useGameState } from "@/providers/game-state-provider";

Howler.autoSuspend = false;

type SecondArg<F> = F extends (a: any, b: infer T, ...args: any[]) => any ? T : never;
export type UseSoundOptions = SecondArg<typeof useSound>;

export default function BackgroundMusic({ path, options }: { path: string; options?: UseSoundOptions }) {
  const [{ audioLocked, windowHasFocus, settings }] = useGameState();
  const [, { stop, sound }] = useSound(path, {
    soundEnabled: !audioLocked && settings.audio,
    interrupt: true,
    loop: true,
    volume: 0.2,
    ...options,
  });

  useEffect(() => {
    return stop;
  }, [stop]);

  useEffect(() => {
    if (!settings.audio || !sound) {
      return;
    }
    let soundId: any;
    if (windowHasFocus) {
      soundId = sound.play();
    }
    return () => sound.pause(soundId);
  }, [sound, settings.audio, windowHasFocus]);

  return null;
}
