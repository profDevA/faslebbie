"use client";

import { useState } from "react";
import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import ResearchContent from "@/components/ResearchContent";
import ResearchModal from "@/components/ResearchModal";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import type { ResearchSectionId } from "@/lib/research";
import {
  researchAreas,
  researchClosing,
  researchSections,
} from "@/lib/research";
import type { ResearchContentData } from "@/lib/researchFromSanity";

// Research page shell (Figma 1-40936 → 1-41067). Same pinned reveal as About /
// Leadership: the "Research" watermark starts in front and recedes as the
// portrait + prose brighten forward. Red words in the prose open a paged modal.
export default function ResearchBody({
  content,
}: {
  content?: ResearchContentData;
}) {
  const areas = content?.areas ?? researchAreas;
  const closing = content?.closing ?? researchClosing;
  const sections = content?.sections ?? researchSections;

  const { r, pin } = useReveal(true);
  const [openId, setOpenId] = useState<ResearchSectionId | null>(null);

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  return (
    <div className="relative">
      <div className="lg:sticky lg:top-[52px]">
        <main className="relative z-10 mx-auto grid w-full max-w-[1350px] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16">
          <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
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
              onOpen={setOpenId}
              areas={areas}
              closing={closing}
            />
          </div>
        </main>
      </div>
      {/* Pin scroll distance (desktop only). */}
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />

      <ResearchModal
        openId={openId}
        onClose={() => setOpenId(null)}
        sections={sections}
      />
    </div>
  );
}
