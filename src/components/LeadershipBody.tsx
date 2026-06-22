"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LeadershipContent from "@/components/LeadershipContent";

/**
 * Desktop reveal (Figma 504:3182 → 504:3254, "like home"): at the top the whole
 * content block — left portrait + prose — sits dimmed BEHIND the big "Leadership"
 * watermark; as you scroll up it brightens to full contrast while the watermark
 * fades grey and drops behind. Mobile has no watermark, so the content stays at
 * full opacity.
 */

// smoothstep ramp: 0 below `a`, 1 above `b`, eased between.
function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

export default function LeadershipBody({
  logoSvgs,
}: {
  logoSvgs: Record<string, string>;
}) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 1024) {
        setOpacity(1);
        return;
      }
      const range = window.innerHeight * 0.7;
      const p = range > 0 ? Math.min(1, window.scrollY / range) : 0;
      setOpacity(0.18 + ramp(0.05, 0.8, p) * 0.82);
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
    <main
      style={{ opacity }}
      className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 will-change-[opacity] lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-16"
    >
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
          className="mt-[72px] h-[299px] w-full bg-[#f0f0f0] object-cover object-top lg:mt-6 lg:h-[286px] lg:w-[260px]"
        />
      </div>

      <LeadershipContent className="pb-24" logoSvgs={logoSvgs} />
    </main>
  );
}
