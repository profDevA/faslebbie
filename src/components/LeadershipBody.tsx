"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import { useState } from "react";
import LeadershipContent from "@/components/LeadershipContent";
import LeadershipGallery from "@/components/LeadershipGallery";
import LeadershipMomentPopup from "@/components/LeadershipMomentPopup";
import LeadershipWatermark from "@/components/LeadershipWatermark";
import { NavPillButton } from "@/components/InlineToken";
import type { Testimonial } from "@/lib/content";
import type { LeadershipContentData } from "@/lib/leadershipFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { usePersistedView } from "@/hooks/usePersistedView";

type View = "txt" | "img";
const VIEWS = ["txt", "img"] as const;

/**
 * Holistic Leadership page — content from Sanity only.
 */
export default function LeadershipBody({
  content,
  testimonials = [],
}: {
  content: LeadershipContentData;
  testimonials?: Testimonial[];
}) {
  const moments = content.moments;

  const [view, setView] = usePersistedView<View>(VIEWS, "txt");
  const [openId, setOpenId] = useState<string | null>(null);
  // Reveal/pin (txt view only). Re-arms when toggling back to ".txt".
  const { r, pin } = useReveal(view === "txt");

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative">
      {/* Watermark: front→back reveal in ".txt", forced receded behind ".img". */}
      <LeadershipWatermark receded={view === "img"} />

      {view === "txt" ? (
        <>
          {/* Desktop pin: sticks under the nav so the content brightens in place
              before the page scrolls (same as About/Work). */}
          <div className={STICKY_UNDER_NAV}>
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} py-12 lg:py-16`}>
              <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
                {/* Mobile (Figma 1-45348): portrait first, then the "Leadership"
                    heading that recedes on scroll. Desktop (Figma 1-44995 →
                    1-45057): the portrait sits top-left beside the wordmark and
                    stays clear in BOTH the top and reading states — so it's
                    exempt from the reveal fade/blur (only the subtle forward
                    drift applies); the prose still brightens in. */}
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
                  intro={content.intro}
                  lead={content.lead}
                  closing={content.closing}
                  expansions={content.expansions}
                  momentsHeading={content.momentsHeading}
                  exploreText={content.exploreText}
                  contactText={content.contactText}
                  testimonials={testimonials}
                  onExplore={() => switchView("img")}
                />
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          <div className="relative z-20 flex items-center justify-center pt-9 lg:pt-12">
            <NavPillButton onClick={() => switchView("txt")}>
              Back to Approach
            </NavPillButton>
          </div>
          <main className="relative z-10 w-full pb-24 pt-6 lg:pt-10">
            <LeadershipGallery items={moments} onOpen={setOpenId} />
          </main>
        </>
      )}

      <LeadershipMomentPopup
        items={moments}
        openId={openId}
        onNavigate={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
