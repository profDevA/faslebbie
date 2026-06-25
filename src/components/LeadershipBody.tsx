"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LeadershipContent from "@/components/LeadershipContent";
import {
  contentDrift,
  pinPx,
  portraitDrift,
  revealBlur,
  revealOpacity,
  revealProgress,
} from "@/lib/reveal";

/**
 * Desktop reveal (Figma 504:3182 → 504:3254, "like home") — same pinned
 * transition as About: at the top only the "Leadership" watermark is sharp and
 * in front, the portrait + prose sit dim + blurred behind it. As you start
 * scrolling the content is PINNED (held in place) and simply brightens +
 * de-blurs + drifts forward while the watermark fades grey and drops behind;
 * only then does the page scroll and the portrait stick under the nav. Mobile:
 * no watermark / pin / reveal — content sits settled at full opacity.
 *
 * The pin is a sticky wrapper + spacer; opacity/blur/drift are applied PER-LEAF
 * (portrait <img> + prose column), never on the wrapper / <main> / portrait
 * column, so no transform containing-block breaks the nested sticky.
 */

export default function LeadershipBody({
  logoSvgs,
}: {
  logoSvgs: Record<string, string>;
}) {
  // Reveal progress: 0 = behind + dim + blurred (page top), 1 = settled/clear.
  const [r, setR] = useState(1);
  const [pin, setPin] = useState(0);

  useEffect(() => {
    const onScroll = () => {
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
        <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-16">
          {/* Stick the portrait where it starts so it never floats up on
              release: pin wrapper top (52) + main top padding (py-16 = 64) =
              116px. Keeps the photo fixed from the very top to the end. */}
          <div className="flex flex-col lg:sticky lg:top-[116px] lg:self-start">
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
            <LeadershipContent className="pb-24" logoSvgs={logoSvgs} />
          </div>
        </main>
      </div>
      {/* Pin scroll distance (desktop only). */}
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
    </div>
  );
}
