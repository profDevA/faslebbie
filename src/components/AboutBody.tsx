"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import AboutContent from "@/components/AboutContent";
import type { AboutContentData } from "@/lib/aboutFromSanity";
import { aboutLogos, type Testimonial } from "@/lib/content";
import { STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";

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
  testimonials,
  content,
}: {
  logoSvgs: Record<keyof typeof aboutLogos, string>;
  testimonials?: Testimonial[];
  /** Bio / expansions / links from Sanity (see lib/aboutFromSanity). */
  content?: AboutContentData;
}) {
  // Reveal progress (0 = behind + dim + blurred, 1 = settled/clear) + pin
  // distance. Latches at 1 on first completion so scrolling back up never
  // replays the entrance (Israel 07/02).
  const { r, pin } = useReveal(true);

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  return (
    <div className="relative">
      {/* Desktop pin: sticks under the nav (82px) for `pin` px of scroll
          so the content brightens in place before the page scrolls. */}
      <div className={STICKY_UNDER_NAV}>
        <main className="relative z-10 mx-auto grid w-full max-w-[1350px] grid-cols-1 gap-10 px-6 pb-12 pt-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-32">
        {/* Portrait column — shared sticky offset so the photo rests at the same
            height as every other page (Fas 07/28). */}
        <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
          {/* Wordmark is AboutWatermark (background, mobile + desktop). */}
          <h1 className="sr-only">About Me</h1>
          <PagePortrait
            style={{ opacity, filter: blur, transform: portraitDrift(r) }}
            className="relative z-10 !bg-transparent mix-blend-multiply will-change-[opacity,filter,transform]"
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
          className="relative z-10 mt-12 will-change-[opacity,filter,transform] lg:mt-0"
        >
          <AboutContent
            className="pb-24"
            logoSvgs={logoSvgs}
            testimonials={testimonials}
            headline={content?.headline}
            intro={content?.intro}
            paragraphs={content?.paragraphs}
            expansions={content?.expansions}
            links={content?.links}
          />
        </div>
        </main>
      </div>
      {/* Pin scroll distance (desktop only): the wrapper above stays stuck for
          this height, during which the content brightens in place. */}
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
    </div>
  );
}
