/**
 * This file is not used currently!
 */
import { createXRStore } from "@react-three/xr";

export const xrStore = createXRStore();

let hasVRSupport = "xr" in window.navigator;

export function hasXR() {
  return hasVRSupport;
}
