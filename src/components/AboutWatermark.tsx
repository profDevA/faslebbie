"use client";

import { useEffect, useState } from "react";
import { PIN_VH } from "@/lib/reveal";

/**
 * Big "About Me" watermark (Figma 807:19241) — the desktop page heading. Neue
 * Haas Grotesk 75 Bold, 200px @1440 (~14vw), near-black (#171717) with a soft
 * grey drop-shadow. It lives in a FIXED, parallax background layer: at the top
 * it sits ON TOP of the content (sharp, dark); as the page scrolls its colour
 * fades toward the page grey and it drops behind every section as a faint
 * watermark, letting the real bio read in front (same behaviour as the homepage
 * wordmark). Desktop only — mobile keeps the small heading.
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

export default function AboutWatermark() {
  const [p, setP] = useState(0); // 0 = top, 1 = scrolled past the fade range

  useEffect(() => {
    const onScroll = () => {
      // Match AboutBody's pin distance so the word recedes over exactly the
      // scroll where the bio brightens in place, then settles behind it.
      const range = window.innerHeight * PIN_VH;
      setP(range > 0 ? Math.min(1, window.scrollY / range) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const fade = ramp(0.05, 0.85, p);
  const color = mix(fade);
  // Soft grey drop-shadow (Figma #b1afac) that dissolves as the word recedes.
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - fade).toFixed(3)})`;
  // Fade the word down to ~30% once it recedes so it's only barely perceptible
  // behind the bio (Fas 06/23).
  const opacity = 1 - fade * 0.7;
  // On top at the start (the dim bio reads as the back layer behind it); drops
  // behind once it fades (pointer-events stay off).
  const z = fade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none fixed inset-0 hidden select-none items-center overflow-hidden px-[6.4vw] font-grotesk font-bold capitalize leading-[0.88] tracking-[-0.021em] will-change-[color,opacity] lg:flex"
    >
      {/* Sits in the lower third (Figma 807:19241 ~63% down), like the Home
          wordmark — pushed below centre rather than vertically centred. Nudged
          a touch lower to match the Home wordmark (Israel 06/24 — "bring the
          About down a bit… do the same on the home page"). */}
      <span className="translate-y-[20vh] text-[clamp(48px,14vw,200px)]">
        About Me
      </span>
    </div>
  );
}
