"use client";

import { useScrollTopOnMount } from "@/lib/useScrollTopOnMount";
import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import ResearchContent from "@/components/ResearchContent";
import ResearchModal from "@/components/ResearchModal";
import { LISTING_GRID, LISTING_INSET_X, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { usePopupRoute } from "@/hooks/usePopupRoute";
import { researchSectionOrder, type ResearchSectionId } from "@/lib/research";
import type { ResearchContentData } from "@/lib/researchFromSanity";

// Research page shell — content from Sanity only.
export default function ResearchBody({
  content,
  initialOpen = null,
}: {
  content: ResearchContentData;
  /** /research/<section> — the page opens with that popup up (Nov 17). */
  initialOpen?: ResearchSectionId | null;
}) {
  const { areas, closing, sections } = content;

  useScrollTopOnMount();
  const { r, pin } = useReveal(true);
  // Each popup has an address: /research/paradigms, /research/field-notes…
  const { openId, open, navigate, close } = usePopupRoute(
    "/research",
    researchSectionOrder,
    initialOpen,
  );

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  return (
    <div className="relative">
      <div className={STICKY_UNDER_NAV}>
        <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} py-12 lg:py-16`}>
          <div
            className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}
          >
            <h1 className="sr-only">Research</h1>
            <PagePortrait
              style={{ opacity, filter: blur, transform: portraitDrift(r) }}
              className="relative z-10 will-change-[opacity,filter,transform]"
            />
          </div>

          <div
            style={{
              opacity,
              filter: blur,
              transform: contentDrift(r),
              pointerEvents: r < 1 ? "none" : undefined,
            }}
            className="relative z-10 mt-12 will-change-[opacity,filter,transform] lg:mt-0"
          >
            <ResearchContent
              className="pb-24"
              onOpen={open}
              areas={areas}
              closing={closing}
            />
          </div>
        </main>
      </div>
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />

      <ResearchModal
        openId={openId}
        onNavigate={navigate}
        onClose={close}
        sections={sections}
      />
    </div>
  );
}
