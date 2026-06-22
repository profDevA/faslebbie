"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import HeroParagraph from "@/components/HeroParagraph";

/**
 * aidesign-os-style shell hero (Fas 06/14 ask — reference: aidesign-os.com).
 *
 * Faithful behaviour (Fas 06/22):
 *  - The giant "Fas lebbie / Ph.D." wordmark NEVER moves, scales or wobbles. It
 *    lives in a FIXED, parallax background layer that stays put while the page
 *    scrolls over it — so it remains behind every section, all the way down.
 *  - It is slightly soft (tiny ~2px text-shadow), not sharp.
 *  - On scroll its colour fades from near-black toward the page grey; the real
 *    content (the clickable paragraph, then the About copy) reads on top.
 */

// smoothstep ramp: 0 below `a`, 1 above `b`, eased in between.
function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// linear blend between two rgb triples → "rgb(r, g, b)"
const NEAR_BLACK: [number, number, number] = [32, 32, 30];
const FADED_GREY: [number, number, number] = [183, 183, 175];
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function V2Hero() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0); // 0 = top, 1 = past the hero scroll range

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        total,
      );
      setP(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scroll-driven colour fade only (no movement). `fade` 0 → 1, then stays.
  const fade = ramp(0.08, 0.62, p);
  const nameColor = mix(fade);
  const nameShadow = `0 0 4px ${nameColor}`;
  const portraitOpacity = 0.15 + (1 - fade) * 0.85; // colour photo → faint ghost

  // Content comes forward (opacity only — it does not move).
  const paraOpacity = 0.1 + ramp(0.12, 0.6, p) * 0.9;
  const paraFront = fade >= 0.45;

  return (
    <section ref={ref} className="relative h-[240vh] shrink-0">
      {/* FIXED parallax background — stays behind every section of the page.
          Layout per Figma 224-747: "Fas lebbie" + portrait on one line, then
          "Ph.D." on the next line, right-aligned. No background words. */}
      <div
        aria-hidden
        style={{ color: nameColor, textShadow: nameShadow }}
        className="pointer-events-none fixed inset-0 -z-10 flex select-none flex-col justify-end gap-[0.5vh] overflow-hidden px-[5vw] pb-[10vh] font-grotesk font-bold leading-[0.82] tracking-[-0.03em] will-change-[color] lg:justify-center lg:gap-[4vh] lg:px-[3vw] lg:pb-0"
      >
        <div className="flex items-center gap-[2vw]">
          <span className="text-[12vw] lg:text-[clamp(64px,13vw,190px)]">
            Fas lebbie
          </span>
          <Image
            src="/portrait.png"
            alt=""
            width={161}
            height={145}
            priority
            style={{ opacity: portraitOpacity }}
            className="aspect-161/145 w-16 object-cover object-top lg:w-[clamp(96px,11vw,161px)]"
          />
        </div>
        <span className="self-end pr-[1vw] text-[12vw] lg:text-[clamp(64px,13vw,190px)]">
          Ph.D.
        </span>
      </div>

      {/* (1) → (2) counter (fixed, subtle) */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-6 top-6 z-30 font-grotesk text-[14px] tabular-nums tracking-[0.15em] text-black/40"
      >
        ({p < 0.5 ? 1 : 2})<span className="text-black/20"> / (2)</span>
      </div>

      {/* Interactive paragraph — fades to the foreground (opacity only). */}
      <div
        style={{ opacity: paraOpacity, pointerEvents: paraFront ? "auto" : "none" }}
        className="sticky top-0 flex h-screen items-center justify-center px-6"
      >
        <div className="mx-auto w-full max-w-272">
          <HeroParagraph className="text-center" storyHref="#about" />
        </div>
      </div>
    </section>
  );
}
