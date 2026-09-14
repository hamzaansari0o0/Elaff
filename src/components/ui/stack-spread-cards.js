// Plain data/helper module (no 'use client') so server components can call
// buildCards() directly — a function exported from a 'use client' file can
// only be rendered/passed as a prop from a server component, not invoked.

// Fixed scatter layout for 8 slots — position/rotation/scale/z, independent
// of which image fills each one. Swap in real content via `buildCards`.
export const CARD_LAYOUT = [
  { stackOffset: { x: -8, y: -10 }, stackRotate: -18, target: { x: -20, y: -34, rotate: 0, scale: 0.7, w: 17, h: 22 }, targetSm: { x: -22, y: -40 }, z: 2 },
  { stackOffset: { x: 14, y: -10 }, stackRotate: 20, target: { x: 32, y: -30, rotate: 0, scale: 0.9, w: 18, h: 32 }, targetSm: { x: 22, y: -40 }, z: 3 },
  { stackOffset: { x: -16, y: 0 }, stackRotate: -4, target: { x: -36, y: -2, rotate: 0, scale: 0.9, w: 15, h: 32 }, targetSm: { x: -22, y: -19 }, z: 4 },
  { stackOffset: { x: 1, y: -10 }, stackRotate: -2, target: { x: 6, y: -32, rotate: 0, scale: 0.8, w: 25, h: 30 }, targetSm: { x: 22, y: -19 }, z: 5 },
  { stackOffset: { x: 18, y: 1 }, stackRotate: 6, target: { x: 37, y: 6, rotate: 0, scale: 0.8, w: 18, h: 32 }, targetSm: { x: -22, y: 20 }, z: 6 },
  { stackOffset: { x: -6, y: 10 }, stackRotate: 6, target: { x: -24, y: 34, rotate: 0, scale: 0.9, w: 22, h: 25 }, targetSm: { x: 22, y: 20 }, z: 7 },
  { stackOffset: { x: 8, y: 7 }, stackRotate: 3, target: { x: 2, y: 36, rotate: 0, scale: 0.8, w: 20, h: 26 }, targetSm: { x: -22, y: 40 }, z: 8 },
  { stackOffset: { x: 20, y: 12 }, stackRotate: -7, target: { x: 30, y: 34, rotate: 0, scale: 0.9, w: 16, h: 20 }, targetSm: { x: 22, y: 40 }, z: 9 },
];

// Zips up to 8 `{ src, alt }` items onto the fixed layout above.
export function buildCards(items) {
  return CARD_LAYOUT.slice(0, items.length).map((layout, i) => ({ ...layout, item: items[i] }));
}
