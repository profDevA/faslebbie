"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_REVEAL, PIN_VH, wordmarkOpacity } from "@/lib/reveal";

/**
 * Big centered "Words + Media" watermark (Figma 318-5704 / 16-951). Same recede
 * as the other pages: sharp + near-black ON TOP of the content at the top of the
 * page, then it fades toward the page grey and drops behind everything as you
 * scroll. Unlike the other pages this one is centered and shown on mobile too
 * (mobile 16:2335 parks 58px type lower on the canvas, not over the first title).
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

export default function BlogsWatermark() {
  const [fade, setFade] = useState(INTRO_REVEAL ? 0 : 1);
  const fadeMax = useRef(0);

  useEffect(() => {
    if (!INTRO_REVEAL) return; // stays receded; see INTRO_REVEAL in lib/reveal

    const onScroll = () => {
      // Mobile settles faster (shorter viewport) so the wordmark clears sooner.
      const factor = window.innerWidth < 1024 ? 0.6 : PIN_VH;
      const range = window.innerHeight * factor;
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
  const shadow = `-0.2vw 0.3vw 0.4vw rgba(177, 175, 172, ${(1 - fade).toFixed(3)})`;
  const opacity = wordmarkOpacity(fade);
  const z = fade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none absolute inset-0 flex select-none items-start justify-start overflow-hidden px-5 pt-[640px] font-grotesk font-bold leading-[0.98] tracking-[1px] will-change-[color,opacity] lg:fixed lg:items-center lg:justify-center lg:px-4 lg:pt-0 lg:leading-[0.9] lg:tracking-[-0.022em]"
    >
      <span className="text-[58px] lg:text-[clamp(40px,12vw,190px)]">
        Words + Media
      </span>
    </div>
  );
}
