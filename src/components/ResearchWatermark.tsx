"use client";

import { useEffect, useRef, useState } from "react";
import { PIN_VH } from "@/lib/reveal";

/**
 * Big "Research" watermark (Figma 1-40936 → 1-41067) — the desktop page header.
 * Same behaviour as the Leadership/About watermark: it starts sharp + near-black
 * ON TOP of the dimmed prose, then as the page scrolls it fades toward the page
 * grey and drops behind every section, reading as a faint watermark. Desktop
 * only — mobile uses the small heading rendered inside ResearchBody.
 */

function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

const NEAR_BLACK: [number, number, number] = [23, 23, 23];
const FADED_GREY: [number, number, number] = [183, 183, 175];
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function ResearchWatermark() {
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

  const color = mix(fade);
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - fade).toFixed(3)})`;
  const opacity = 1 - fade * 0.7;
  const z = fade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none fixed inset-0 hidden select-none items-center overflow-hidden px-[5.6vw] font-grotesk font-bold leading-[0.9] tracking-[-0.022em] will-change-[color,opacity] lg:flex"
    >
      <span className="text-[clamp(48px,13vw,190px)]">Research</span>
    </div>
  );
}
