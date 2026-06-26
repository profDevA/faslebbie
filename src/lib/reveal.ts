// Shared "transition" math (Israel's signature scroll reveal). Every page uses
// the SAME move: the big wordmark/watermark recedes into the background while
// the real content + portrait start dim + softly blurred BEHIND it and ease
// FORWARD — brightening + de-blurring. NO scaling.
//
// Israel 06/25: the content must NOT slide sideways — "when it becomes clear it
// moves to the left… it should just become clear, only comes up." So the
// horizontal drift is removed; the content only brightens + de-blurs and rises
// a touch (the portrait simply stays put and clarifies).
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
// This is ALSO the "pin" distance (Israel 06/24): for this much scroll the
// content is held in place and only brightens / comes forward (the page proper
// doesn't scroll yet); after it, normal scrolling begins.
export const REVEAL_VH = 0.8;
export const PIN_VH = REVEAL_VH;

// Dim/blur the back layer starts at (matches the prior About/Home feel).
export const START_OPACITY = 0.32;
export const START_BLUR = 2; // px

// Subtle drift magnitudes in px. Kept small on purpose. No scale, no sideways
// motion (Israel 06/25) — only the content rises a touch as it clarifies.
const DRIFT = {
  x: 0, // no horizontal motion
  portraitY: 0, // portrait stays put, just clarifies
  contentY: 16, // content starts slightly lower and rises as it brightens
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

// Pin amount in px from the page-top scroll position. While scrollY is within
// [0, pinPx] the content is held (translated to look fixed) and only brightens;
// past it, the page scrolls normally.
export function pinPx(innerHeight: number) {
  return Math.round((innerHeight || 0) * PIN_VH);
}

export function portraitDrift(r: number) {
  const k = 1 - r;
  return `translate3d(${(k * DRIFT.x).toFixed(2)}px, ${(k * DRIFT.portraitY).toFixed(2)}px, 0)`;
}

export function contentDrift(r: number) {
  const k = 1 - r;
  return `translate3d(${(k * DRIFT.x).toFixed(2)}px, ${(k * DRIFT.contentY).toFixed(2)}px, 0)`;
}
