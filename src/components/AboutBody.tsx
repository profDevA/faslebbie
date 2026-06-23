"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AboutContent from "@/components/AboutContent";
import { aboutLogos } from "@/lib/content";

/**
 * Desktop reveal (Figma 807:19122 → 19414, "like home"): the bio (left portrait
 * + prose) starts dimmed BEHIND the big "About Me" watermark and is PINNED in
 * place while it brightens to full contrast — so it doesn't scroll away before
 * it's readable/clickable. Once fully bright the pin releases and the page
 * scrolls normally. The watermark fades grey and drops behind over the same
 * range. Mobile has no watermark/pin — content stays full opacity.
 *
 * The pin is a tall `position: sticky` block: the bio sticks under the nav for
 * `PIN_VH` of scroll (a trailing spacer supplies that slack), then unsticks.
 */

const PIN_VH = 0.85; // share of viewport height the bio stays pinned while it brightens

// smoothstep ramp: 0 below `a`, 1 above `b`, eased between.
function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

export default function AboutBody({
  logoSvgs,
}: {
  logoSvgs: Record<keyof typeof aboutLogos, string>;
}) {
  const [opacity, setOpacity] = useState(1);
  const [pinPx, setPinPx] = useState(0); // height of the slack spacer (desktop)

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 1024) {
        setOpacity(1);
        setPinPx(0);
        return;
      }
      const range = window.innerHeight * PIN_VH;
      setPinPx(range);
      const p = range > 0 ? Math.min(1, window.scrollY / range) : 1;
      // Brighten a touch faster than the pin so it's fully clear before release.
      setOpacity(0.18 + ramp(0, 0.82, p) * 0.82);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="relative">
      <main
        style={{ opacity }}
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 will-change-[opacity] lg:sticky lg:top-[52px] lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16"
      >
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
            className="mt-[72px] h-[299px] w-full bg-[#f0f0f0] object-cover object-top lg:mt-6 lg:h-[299px] lg:w-[271px]"
          />
        </div>

        <AboutContent className="pb-24" logoSvgs={logoSvgs} />
      </main>

      {/* Slack that lets the bio stay pinned while it brightens (desktop only). */}
      <div aria-hidden style={{ height: pinPx }} className="hidden lg:block" />
    </div>
  );
}
