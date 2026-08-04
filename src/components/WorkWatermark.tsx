"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_REVEAL, PIN_VH } from "@/lib/reveal";
import ToolStack from "@/components/ToolStack";
import { WORDMARK_TOP } from "@/components/PagePortrait";

/**
 * Big "Design Work" watermark (Figma 807:2979 desktop / 1:14815 mobile).
 * Fixed parallax layer: fades to page grey and sits behind content.
 *
 * Mobile (Fas 07/30 / Figma 1:14815): no foreground heading — wordmark + Stack
 * sit just under the portrait (background), same idea as desktop. With
 * INTRO_REVEAL off it starts fully receded on both breakpoints.
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

export default function WorkWatermark({
  show = true,
  receded = false,
}: {
  show?: boolean;
  /** Force the fully-receded (faint grey, behind) state regardless of scroll —
   *  used by the ".img" grid, where the wordmark always sits in the back. */
  receded?: boolean;
}) {
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

  if (!show) return null;

  const effFade = receded ? 1 : fade;
  const color = mix(effFade);
  const shadow = `-0.27vw 0.36vw 0.4vw rgba(177, 175, 172, ${(1 - effFade).toFixed(3)})`;
  const opacity = 1 - effFade * 0.7;
  const z = effFade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className={`pointer-events-none absolute inset-0 select-none flex-col items-start overflow-hidden px-5 will-change-[color,opacity] sm:px-6 lg:fixed lg:flex lg:px-[5.6vw] pt-[402px] ${WORDMARK_TOP} ${
        receded ? 'hidden' : 'flex'
      }`}
    >
      {/* Mobile: `absolute`, so the block is anchored to the page and scrolls
          away with the photo instead of sitting under whatever prose happens to
          be passing the viewport. pt clears nav + .txt/.img + portrait so it
          lands in the gap at the bottom of the photo (Figma 1:14815 — wordmark
          @ ~643 / photo ends ~569). lg:pt-120 (WORDMARK_TOP) takes over on
          desktop, where the wordmark is a fixed layer in the left column. */}
      <div>
        <span className="block whitespace-nowrap font-grotesk text-[60px] font-bold capitalize leading-[0.95] tracking-[1px] lg:text-[clamp(48px,13vw,200px)] lg:leading-[0.88] lg:tracking-[-0.021em]">
          Design Work
        </span>
        <div className="mt-3 flex items-center gap-5 pl-0.5 lg:mt-[1.4vw] lg:gap-[31px] lg:pl-[0.4vw]">
          <span className="shrink-0 font-serif text-[16px] tracking-[0.06em] lg:text-[20px] xl:text-[26px]">
            Stack:
          </span>
          <div className="origin-left scale-[0.58] lg:scale-100">
            <ToolStack className="gap-x-[18px] lg:gap-x-[30px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
