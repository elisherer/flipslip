import { KeyboardControlsEntry } from "@react-three/drei";

export enum KeyControl {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
  interact = "interact",
  ufo_up = "ufo_up",
  ufo_down = "ufo_down",
  ufo_left = "ufo_left",
  ufo_right = "ufo_right",
  ufo_interact = "ufo_interact",
}

export const KEYBOARD_MAP: KeyboardControlsEntry[] = [
  { name: KeyControl.up, keys: ["KeyW"] },
  { name: KeyControl.down, keys: ["KeyS"] },
  { name: KeyControl.left, keys: ["KeyA"] },
  { name: KeyControl.right, keys: ["KeyD"] },
  { name: KeyControl.interact, keys: ["Space"] },
  { name: KeyControl.ufo_up, keys: ["ArrowUp"] },
  { name: KeyControl.ufo_down, keys: ["ArrowDown"] },
  { name: KeyControl.ufo_left, keys: ["ArrowLeft"] },
  { name: KeyControl.ufo_right, keys: ["ArrowRight"] },
  { name: KeyControl.ufo_interact, keys: ["Enter"] },
];
