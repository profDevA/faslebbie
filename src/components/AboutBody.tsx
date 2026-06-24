"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AboutContent from "@/components/AboutContent";
import { aboutLogos } from "@/lib/content";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
  revealProgress,
} from "@/lib/reveal";

/**
 * Desktop reveal (Figma 807:19122 → 19414, "like home"): the bio (left portrait
 * + prose) starts dim + softly blurred BEHIND the big "About Me" watermark and
 * eases FORWARD as you scroll — brightening + de-blurring while drifting a touch
 * (portrait settles down-left, the prose rises up-left) — while the watermark
 * fades grey and drops behind. NO scaling. The portrait then sticks under the
 * nav alongside the long bio. Mobile has no watermark/reveal — content sits
 * settled at full opacity.
 *
 * opacity/blur/transform are applied PER-LAYER (the portrait image + the content
 * column), never on <main>, so they don't create a containing block that would
 * break the sticky portrait.
 */

export default function AboutBody({
  logoSvgs,
}: {
  logoSvgs: Record<keyof typeof aboutLogos, string>;
}) {
  // Reveal progress: 0 = pushed back + dim (page top), 1 = settled + clear.
  const [r, setR] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      // Mobile: no reveal — content sits settled/clear.
      setR(
        window.innerWidth < 1024
          ? 1
          : revealProgress(window.scrollY, window.innerHeight),
      );
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
      <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-12 pt-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="flex flex-col lg:sticky lg:top-[88px] lg:self-start">
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
          style={{ opacity, filter: blur, transform: contentDrift(r) }}
          className="will-change-[opacity,filter,transform]"
        >
          <AboutContent className="pb-24" logoSvgs={logoSvgs} />
        </div>
      </main>
    </div>
  );
}
