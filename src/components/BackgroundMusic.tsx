import useBackgroundMusic, { UseSoundOptions } from "@/hooks/use-background-music";

export default function BackgroundMusic({ path, options }: { path: string; options?: UseSoundOptions }) {
  useBackgroundMusic(path, options);
  return null;
}
