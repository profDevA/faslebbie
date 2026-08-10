"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_REVEAL, PIN_VH, wordmarkOpacity } from "@/lib/reveal";
import { WORDMARK_TOP } from "@/components/PagePortrait";

/**
 * Big "Research" watermark (Figma 1-40936). Mobile (Fas 07/30): background
 * wordmark at the bottom of the portrait.
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
  const [fade, setFade] = useState(INTRO_REVEAL ? 0 : 1);
  const fadeMax = useRef(0);

  useEffect(() => {
    if (!INTRO_REVEAL) return;

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
  const opacity = wordmarkOpacity(fade);
  const z = fade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className={`pointer-events-none absolute inset-0 flex select-none items-start overflow-hidden px-5 font-grotesk font-bold capitalize leading-[0.95] tracking-[1px] will-change-[color,opacity] sm:px-6 lg:fixed lg:px-[5.6vw] lg:leading-[0.9] lg:tracking-[-0.022em] pt-[404px] ${WORDMARK_TOP}`}
    >
      <span className="text-[58px] lg:text-[clamp(48px,13vw,190px)]">
        Research
      </span>
    </div>
  );
}
