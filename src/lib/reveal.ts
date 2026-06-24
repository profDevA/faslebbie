// Shared "transition" math (Israel's signature scroll reveal). Every page uses
// the SAME move: the big wordmark/watermark recedes into the background while
// the real content + portrait start dim + softly blurred BEHIND it and ease
// FORWARD — brightening + de-blurring while drifting a touch in a diagonal
// direction. NO scaling — translation + opacity (+ a little blur) is enough.
//
// Directions (Israel 06/24):
//  • portrait: from back-right-TOP → front-left-BOTTOM  (drifts left + down)
//  • content : from back-right-BOTTOM → front-left-TOP  (rises: left + up)
//
// `r` is the eased reveal progress: 0 = pushed back/dim (page top), 1 = settled
// in front/clear. `k = 1 - r` is the remaining offset, so everything lands at
// identity (opacity 1, no blur, no translate).

// smoothstep ramp: 0 below `a`, 1 above `b`, eased between.
export function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// Share of a viewport of scroll over which the layers settle to the front.
export const REVEAL_VH = 0.5;

// Dim/blur the back layer starts at (matches the prior About/Home feel).
export const START_OPACITY = 0.32;
export const START_BLUR = 2; // px

// Subtle drift magnitudes in px. Kept small on purpose. No scale.
const DRIFT = {
  x: 16, // both start pushed right, settle left
  portraitY: -12, // portrait starts higher, settles down
  contentY: 20, // content starts lower, rises up
};

// Eased reveal progress from the page scroll position (0 = back, 1 = front).
export function revealProgress(scrollY: number, innerHeight: number) {
  const range = innerHeight * REVEAL_VH;
  const p = range > 0 ? Math.min(1, scrollY / range) : 1;
  return ramp(0, 1, p);
}

export function revealOpacity(r: number) {
  return START_OPACITY + r * (1 - START_OPACITY);
}

export function revealBlur(r: number) {
  return (1 - r) * START_BLUR;
}

export function portraitDrift(r: number) {
  const k = 1 - r;
  return `translate3d(${(k * DRIFT.x).toFixed(2)}px, ${(k * DRIFT.portraitY).toFixed(2)}px, 0)`;
}

export function contentDrift(r: number) {
  const k = 1 - r;
  return `translate3d(${(k * DRIFT.x).toFixed(2)}px, ${(k * DRIFT.contentY).toFixed(2)}px, 0)`;
}
