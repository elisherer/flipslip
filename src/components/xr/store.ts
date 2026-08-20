/**
 * This file is not used currently!
 */

//import { createXRStore } from "@react-three/xr";

let hasVRSupport = false;

if ("xr" in window.navigator) {
  window.navigator.xr?.isSessionSupported("immersive-vr").then(supported => {
    hasVRSupport = supported;
  });
}

export function hasVR() {
  return hasVRSupport;
}

//export const store = createXRStore();
