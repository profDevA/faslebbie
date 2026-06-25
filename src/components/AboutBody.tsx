"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AboutContent from "@/components/AboutContent";
import { aboutLogos } from "@/lib/content";
import {
  contentDrift,
  pinPx,
  portraitDrift,
  revealBlur,
  revealOpacity,
  revealProgress,
} from "@/lib/reveal";

/**
 * Desktop reveal (Figma 807:19122 → 19414, "like home"). The transition Israel
 * keeps describing (06/24): at the very top ONLY the big "About Me" watermark is
 * sharp and in front — the portrait + prose sit dim + blurred BEHIND it. As you
 * start scrolling the content is PINNED (held in place, doesn't scroll yet) and
 * simply brightens + de-blurs + drifts forward while the watermark fades grey
 * and drops behind. Only once it has settled does the page actually start
 * scrolling, and the portrait then sticks under the nav alongside the long bio.
 *
 * The pin is a sticky wrapper + a spacer that supplies its scroll distance.
 * opacity/blur/drift are applied PER-LEAF (the portrait <img> and the prose
 * column), never on the sticky wrapper / <main> / portrait column, so no
 * transform containing-block breaks the nested sticky. Mobile: no watermark /
 * pin / reveal — content sits settled at full opacity.
 */

export default function AboutBody({
  logoSvgs,
}: {
  logoSvgs: Record<keyof typeof aboutLogos, string>;
}) {
  // Reveal progress: 0 = behind + dim + blurred (page top), 1 = settled/clear.
  const [r, setR] = useState(1);
  // Pin distance in px (desktop) — the spacer that gives the pin its scroll.
  const [pin, setPin] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      // Mobile: no reveal/pin — content sits settled/clear.
      const mobile = window.innerWidth < 1024;
      setR(mobile ? 1 : revealProgress(window.scrollY, window.innerHeight));
      setPin(mobile ? 0 : pinPx(window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  return (
    <div className="relative">
      {/* Desktop pin: sticks under the nav (h-13 = 52px) for `pin` px of scroll
          so the content brightens in place before the page scrolls. */}
      <div className="lg:sticky lg:top-[52px]">
        <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-12 pt-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-32">
        {/* Stick the portrait exactly where it starts so it never floats up on
            release: pin wrapper top (52) + main top padding (pt-32 = 128) =
            180px. Keeps the photo fixed from the very top to the end. */}
        <div className="flex flex-col lg:sticky lg:top-[180px] lg:self-start">
          {/* Mobile: small left-aligned heading (desktop uses the watermark). */}
          <h1 className="font-grotesk text-[42px] font-bold uppercase leading-[1.1] text-black sm:text-[50px] lg:hidden">
            About me
          </h1>
          {/* Tight head-and-shoulders crop to match Figma 807:19125 (the source
              portrait is a wide shot; this is cropped to the 271:299 frame). */}
          <Image
            src="/portrait-about.png"
            alt="Portrait of Fas Lebbie"
            width={620}
            height={684}
            priority
            style={{ opacity, filter: blur, transform: portraitDrift(r) }}
            className="mt-[72px] h-[299px] w-full bg-[#f0f0f0] object-cover object-top will-change-[opacity,filter,transform] lg:mt-6 lg:h-[299px] lg:w-[271px]"
          />
        </div>

        <div
          style={{
            opacity,
            filter: blur,
            transform: contentDrift(r),
            // While it's still the dim/blurred BACK layer, it must not catch
            // hovers/clicks — only interactive once it has settled in front.
            pointerEvents: r < 1 ? "none" : undefined,
          }}
          className="will-change-[opacity,filter,transform]"
        >
          <AboutContent className="pb-24" logoSvgs={logoSvgs} />
        </div>
        </main>
      </div>
      {/* Pin scroll distance (desktop only): the wrapper above stays stuck for
          this height, during which the content brightens in place. */}
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
    </div>
  );
}
