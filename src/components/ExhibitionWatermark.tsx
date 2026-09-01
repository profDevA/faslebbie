"use client";

import { useEffect, useRef, useState } from "react";
import { WORDMARK_TOP } from "@/components/PagePortrait";
import WordmarkFrame from "@/components/WordmarkFrame";
import { INTRO_REVEAL, PIN_VH, wordmarkOpacity } from "@/lib/reveal";

/** Figma 2823:2700 — same scroll-fade wordmark pattern as Teaching / Work. */
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

export default function ExhibitionWatermark() {
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

  // Gallery page — wordmark sits behind collage (same as Teaching `.img`).
  useEffect(() => {
    fadeMax.current = 1;
    setFade(1);
  }, []);

  const effFade = fade;
  const color = mix(effFade);
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - effFade).toFixed(3)})`;
  const opacity = wordmarkOpacity(effFade);

  return (
    <WordmarkFrame
      style={{ color, textShadow: shadow, zIndex: -10, opacity }}
      className={`font-bold capitalize leading-[0.88] tracking-[-0.022em] pt-[402px] ${WORDMARK_TOP}`}
      innerClassName="flex flex-col items-start"
    >
      <span className="text-[58px] lg:text-[187px]">Student</span>
      <span className="text-[58px] lg:text-[187px] lg:pl-[12%]">Exhibitions</span>
    </WordmarkFrame>
  );
}
