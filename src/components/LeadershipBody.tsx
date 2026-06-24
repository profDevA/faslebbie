"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LeadershipContent from "@/components/LeadershipContent";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
  revealProgress,
} from "@/lib/reveal";

/**
 * Desktop reveal (Figma 504:3182 → 504:3254, "like home"): at the top the content
 * block — left portrait + prose — sits dim + softly blurred BEHIND the big
 * "Leadership" watermark; as you scroll it eases FORWARD (brightens + de-blurs)
 * while drifting a touch (portrait settles down-left, prose rises up-left) and the
 * watermark fades grey and drops behind. NO scaling. Mobile has no watermark, so
 * the content stays settled at full opacity.
 *
 * opacity/blur/transform are applied PER-LAYER (the portrait image + the content
 * column), never on <main>, so they don't create a containing block that would
 * break the sticky portrait.
 */

export default function LeadershipBody({
  logoSvgs,
}: {
  logoSvgs: Record<string, string>;
}) {
  // Reveal progress: 0 = pushed back + dim (page top), 1 = settled + clear.
  const [r, setR] = useState(1);

  useEffect(() => {
    const onScroll = () => {
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
    <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-16">
      <div className="flex flex-col lg:sticky lg:top-[88px] lg:self-start">
        {/* Mobile (Figma 394:2194): small left-aligned heading + full-width
            portrait. Desktop: the watermark is the heading, so hide this one
            and keep just the sticky portrait rail. */}
        <h1 className="font-helvetica text-[42px] font-bold uppercase leading-[1.1] text-black sm:text-[50px] lg:hidden">
          Leadership
        </h1>
        <Image
          src="/portrait.png"
          alt="Portrait of Fas Lebbie"
          width={360}
          height={299}
          priority
          style={{ opacity, filter: blur, transform: portraitDrift(r) }}
          className="mt-[72px] h-[299px] w-full bg-[#f0f0f0] object-cover object-top will-change-[opacity,filter,transform] lg:mt-6 lg:h-[286px] lg:w-[260px]"
        />
      </div>

      <div
        style={{ opacity, filter: blur, transform: contentDrift(r) }}
        className="will-change-[opacity,filter,transform]"
      >
        <LeadershipContent className="pb-24" logoSvgs={logoSvgs} />
      </div>
    </main>
  );
}
