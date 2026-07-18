"use client";

import { useEffect, useRef, useState } from "react";
import { PIN_VH } from "@/lib/reveal";

/**
 * Big "Teaching" watermark (Figma 16-19731 → 16-22597) — the desktop page
 * header. Poppins Bold, near-black with a soft grey drop-shadow. It lives in a
 * FIXED, parallax background layer: at the top it sits ON TOP of the content
 * (sharp, dark); as the page scrolls its colour fades toward the page grey and
 * it drops behind every section as a faint watermark. Desktop only — mobile
 * keeps the small heading (Figma 16-19360 mobile / MobileRecedeHeading).
 */

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

export default function TeachingWatermark({
  receded = false,
}: {
  /** Force the fully-receded (faint grey, behind) state — used by ".img". */
  receded?: boolean;
} = {}) {
  const [fade, setFade] = useState(0);
  const fadeMax = useRef(0);

  useEffect(() => {
    const onScroll = () => {
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

  useEffect(() => {
    if (receded) {
      fadeMax.current = 1;
      setFade(1);
    }
  }, [receded]);

  const effFade = receded ? 1 : fade;
  const color = mix(effFade);
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - effFade).toFixed(3)})`;
  const opacity = 1 - effFade * 0.7;
  const z = effFade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none fixed inset-0 hidden select-none items-center overflow-hidden px-[5.6vw] font-logo font-bold capitalize leading-[0.88] tracking-[-0.022em] will-change-[color,opacity] lg:flex"
    >
      <span className="text-[clamp(48px,13vw,200px)]">Teaching</span>
    </div>
  );
}
