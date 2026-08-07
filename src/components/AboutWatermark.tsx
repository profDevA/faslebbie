"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_REVEAL, PIN_VH } from "@/lib/reveal";
import { WORDMARK_TOP } from "@/components/PagePortrait";

/**
 * Big "About Me" watermark (Figma 807:19241). Fixed parallax layer — fades to
 * page grey behind content. Mobile (Fas 07/30): same background treatment as
 * Work/Teaching — sits at the bottom of the portrait, not a foreground heading.
 *
 * On mobile it is `absolute`, not `fixed`: the single narrow column puts the
 * prose directly over the wordmark, so a viewport-pinned layer collided with
 * whatever text happened to be scrolling past it. Anchored to the page instead,
 * it stays in the gap under the portrait and scrolls away with it.
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

export default function AboutWatermark() {
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
  const opacity = 1 - fade * 0.7;
  // Mobile: always behind (QA — do not pin "About Me" at the top). Desktop
  // keeps the front→back reveal z swap.
  const desktopFront = fade < 0.5;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, opacity }}
      className={`pointer-events-none absolute inset-0 -z-10 flex select-none items-start overflow-hidden px-5 font-grotesk font-bold capitalize leading-[0.95] tracking-[1px] will-change-[color,opacity] sm:px-6 lg:fixed lg:px-[6.4vw] lg:leading-[0.88] lg:tracking-[-0.021em] pt-[404px] ${WORDMARK_TOP} ${
        desktopFront ? "lg:z-30" : "lg:-z-10"
      }`}
    >
      {/* About has no .txt/.img toggle — slightly lower pt than Work/Teaching. */}
      <span className="text-[58px] lg:text-[clamp(48px,14vw,200px)]">
        About Me
      </span>
    </div>
  );
}
