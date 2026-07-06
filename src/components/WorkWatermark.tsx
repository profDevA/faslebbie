"use client";

import { useEffect, useRef, useState } from "react";
import { PIN_VH } from "@/lib/reveal";
import { toolStackLogos } from "@/lib/content";

/**
 * Big "Design Work" watermark (Figma 807:2979) — the desktop page heading, the
 * same treatment as the About watermark: Neue Haas Grotesk 75 Bold, ~200px @1440
 * (~14vw), near-black (#171717) with a soft grey drop-shadow. It lives in a
 * FIXED parallax layer: at the top it sits ON TOP of the content (sharp, dark);
 * as the page scrolls its colour fades toward the page grey and it drops behind
 * every section as a faint watermark. Desktop only — mobile keeps a small
 * heading. Only renders behind the ".txt" view (the grid view passes `show`
 * false) so it doesn't sit over the masonry grid.
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
  // `fade` RATCHETS (never decreases): the reveal plays ONCE, so once "Design
  // Work" has receded it stays behind — scrolling back to the top never brings
  // it forward again (Israel 07/04). The `.img` view forces it fully receded.
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

  // Once forced-receded (switching to `.img`), keep the ratchet pinned so it
  // stays behind after toggling back to `.txt`.
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
      className="pointer-events-none fixed inset-0 hidden select-none flex-col items-start justify-center overflow-hidden px-[5.6vw] will-change-[color,opacity] lg:flex"
    >
      {/* Heading + Stack are ONE block (Figma 807:2976): "Design Work" with the
          tech-stack row flush beneath it; the whole block recedes together. */}
      <div className="translate-y-[6vh]">
        <span className="block whitespace-nowrap font-grotesk text-[clamp(48px,13vw,200px)] font-bold capitalize leading-[0.88] tracking-[-0.021em]">
          Design Work
        </span>
        <div className="mt-[1.4vw] flex items-center gap-[31px] pl-[0.4vw]">
          <span className="font-serif text-[20px] tracking-[0.06em] xl:text-[26px]">
            Stack:
          </span>
          <span className="flex flex-wrap items-center gap-x-[30px] gap-y-3">
            {toolStackLogos.map((logo) => (
              <span
                key={logo.src}
                className="inline-block shrink-0 bg-current"
                style={{
                  width: `${logo.w}px`,
                  height: `${logo.h}px`,
                  WebkitMaskImage: `url(${logo.src})`,
                  maskImage: `url(${logo.src})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
