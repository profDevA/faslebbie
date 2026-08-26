"use client";

import { useEffect, useRef, useState } from "react";
import { WORDMARK_TOP } from "@/components/PagePortrait";
import WordmarkFrame from "@/components/WordmarkFrame";
import { INTRO_REVEAL, PIN_VH, wordmarkOpacity } from "@/lib/reveal";

/**
 * Big "Teaching" watermark (Figma 16-19731 desktop / 1:44550 mobile).
 * Fixed parallax layer — fades to page grey behind content.
 *
 * Mobile (Fas 07/30 / Figma 1:44550): same as Work — wordmark sits at the
 * bottom of the portrait as a background layer, not a foreground heading.
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

  useEffect(() => {
    if (receded) {
      fadeMax.current = 1;
      setFade(1);
    }
  }, [receded]);

  const effFade = receded ? 1 : fade;
  const color = mix(effFade);
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - effFade).toFixed(3)})`;
  const opacity = wordmarkOpacity(effFade);
  const z = effFade < 0.5 ? 30 : -10;

  return (
    <WordmarkFrame
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className={`font-logo font-bold capitalize leading-[0.95] tracking-[1px] lg:leading-[0.88] lg:tracking-[-0.022em] pt-[402px] ${WORDMARK_TOP}`}
    >
      <span className="text-[58px] lg:text-[187px]">Teaching</span>
    </WordmarkFrame>
  );
}
