"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PIN_VH } from "@/lib/reveal";

/**
 * Big "Leadership" watermark (Figma 504:3226 / 504:3254) — the desktop page
 * header. Poppins Bold, ~189px @1440 (13vw), near-black with a soft grey
 * drop-shadow, portrait to its right. It lives in a FIXED, parallax background
 * layer (−z-10): as the page scrolls over it, its colour fades toward the page
 * grey and the portrait dims, so the real content reads on top while the word
 * stays as a faint watermark behind every section. Desktop only — mobile keeps
 * the small heading (Figma 394:2194).
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

export default function LeadershipWatermark() {
  const [p, setP] = useState(0); // 0 = top, 1 = scrolled past the fade range

  useEffect(() => {
    const onScroll = () => {
      // Match LeadershipBody's pin distance (same transition as About).
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
  const portraitOpacity = 1 - fade * 0.8;
  // Fade the word down to ~30% once it recedes (Fas 06/23 — barely perceptible).
  const opacity = 1 - fade * 0.7;
  // Figma 504:3182 → 504:3254: at the top the word + photo sit ON TOP of the
  // content; once it fades it drops behind every section as a watermark.
  // (pointer-events stay off, so it never blocks clicks even while in front.)
  const z = fade < 0.5 ? 30 : -10;

  return (
    <div
      aria-hidden
      style={{ color, textShadow: shadow, zIndex: z, opacity }}
      className="pointer-events-none fixed inset-0 hidden select-none items-center gap-[1.2vw] overflow-hidden px-[5.6vw] font-logo font-bold capitalize leading-[0.9] tracking-[-0.022em] will-change-[color,opacity] lg:flex"
    >
      <span className="text-[clamp(48px,13vw,190px)]">Leadership</span>
      <Image
        src="/portrait.png"
        alt=""
        width={161}
        height={145}
        priority
        style={{ opacity: portraitOpacity }}
        className="aspect-161/145 w-[clamp(72px,11vw,161px)] shrink-0 object-cover object-top"
      />
    </div>
  );
}
