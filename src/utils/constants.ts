const PI_2 = Math.PI / 2;
export const rot = {
  x90: [PI_2, 0, 0],
  x180: [Math.PI, 0, 0],
  x270: [-PI_2, 0, 0],
  y90: [0, PI_2, 0],
  y180: [0, Math.PI, 0],
  y270: [0, -PI_2, 0],
  z90: [0, 0, PI_2],
  z180: [0, 0, Math.PI],
  z270: [0, 0, -PI_2],
} satisfies Record<string, [number, number, number]>;

export const isLocalDev = window.location.hostname === "localhost" || window.location.hash === "#debug";
