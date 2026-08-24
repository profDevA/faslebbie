"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import LeadershipContent from "@/components/LeadershipContent";
import LeadershipWatermark from "@/components/LeadershipWatermark";
import type { LeadershipContentData } from "@/lib/leadershipFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";

/** Approach page (/leadership) — section prose from Sanity only. */
export default function LeadershipBody({
  content,
}: {
  content: LeadershipContentData;
}) {
  const { r, pin } = useReveal(true);

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  return (
    <div className="relative">
      <LeadershipWatermark />

      <div className={STICKY_UNDER_NAV}>
        <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} py-12 lg:py-16`}>
          <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
            <h1 className="sr-only">Approach</h1>
            <PagePortrait
              style={{ transform: portraitDrift(r) }}
              className="relative z-10 will-change-transform"
            />
          </div>

          <div
            style={{
              opacity,
              filter: blur,
              transform: contentDrift(r),
              pointerEvents: r < 0.7 ? "none" : undefined,
            }}
            className="relative z-10 mt-12 will-change-[opacity,filter,transform] lg:mt-0"
          >
            <LeadershipContent
              className="pb-24"
              sections={content.sections}
              expansions={content.expansions}
            />
          </div>
        </main>
      </div>
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
    </div>
  );
}
