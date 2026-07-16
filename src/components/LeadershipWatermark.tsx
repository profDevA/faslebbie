"use client";

import { useEffect, useRef, useState } from "react";
import { PIN_VH } from "@/lib/reveal";

/**
 * Big "Leadership" watermark (Figma 1-44995 → 1-45057) — the desktop page
 * header. Poppins Bold, ~190px @1440 (13vw), near-black with a soft grey
 * drop-shadow. Text-only: the July design keeps the portrait as a separate
 * top-left element in the content column (not attached to the word). It lives
 * in a FIXED, parallax background layer: at the top it sits ON TOP of the
 * content (sharp, dark); as the page scrolls its colour fades toward the page
 * grey and it drops behind every section as a faint watermark. Desktop only —
 * mobile keeps the small heading (Figma 1-45348).
 */

// smoothstep ramp: 0 below `a`, 1 above `b`, eased between.
function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

const NEAR_BLACK: [number, number, number] = [23, 23, 23]; // #171717
const FADED_GREY: [number, number, number] = [183, 183, 175];
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function LeadershipWatermark({
  show = true,
  receded = false,
}: {
  show?: boolean;
  /** Force the fully-receded (faint grey, behind) state regardless of scroll —
   *  used by the ".img" gallery so the word always sits in the back. */
  receded?: boolean;
} = {}) {
  // `fade` RATCHETS (never decreases): the reveal plays ONCE, so once the word
  // recedes it stays behind even when scrolling back to the top (Israel 07/04).
  const [fade, setFade] = useState(0);
  const fadeMax = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      // Match LeadershipBody's pin distance (same transition as About).
      const range = window.innerHeight * PIN_VH;
      const p = range > 0 ? Math.min(1, window.scrollY / range) : 0;
      const next = Math.max(fadeMax.current, ramp(0.05, 0.85, p));
      fadeMax.current = next;
      setFade(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Once forced-receded (switching to ".img"), pin the ratchet so it stays
  // behind after toggling back to ".txt".
  useEffect(() => {
    if (receded) {
      fadeMax.current = 1;
      setFade(1);
    }
  }, [receded]);

  if (!show) return null;

  const effFade = receded ? 1 : fade;
  const color = mix(effFade);
  // Soft grey drop-shadow (Figma #b1afac) that dissolves as the word recedes.
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - effFade).toFixed(3)})`;
  // Fade the word down to ~30% once it recedes (Fas 06/23 — barely perceptible).
  const opacity = 1 - effFade * 0.7;
  // Figma 504:3182 → 504:3254: at the top the word + photo sit ON TOP of the
  // content; once it fades it drops behind every section as a watermark.
  // (pointer-events stay off, so it never blocks clicks even while in front.)
  const z = effFade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none fixed inset-0 hidden select-none items-center overflow-hidden px-[5.6vw] font-logo font-bold capitalize leading-[0.9] tracking-[-0.022em] will-change-[color,opacity] lg:flex"
    >
      <span className="text-[clamp(48px,13vw,190px)]">Leadership</span>
    </div>
  );
}
