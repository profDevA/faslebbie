"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import { useState } from "react";
import BuildContent from "@/components/BuildContent";
import BuildGallery from "@/components/BuildGallery";
import BuildProjectModal from "@/components/BuildProjectModal";
import BuildWatermark from "@/components/BuildWatermark";
import ViewToggle from "@/components/ViewToggle";
import type { BuildContentData } from "@/lib/buildFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import { contentDrift, portraitDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { usePersistedView } from "@/hooks/usePersistedView";

type View = "txt" | "img";
const VIEWS = ["txt", "img"] as const;

/**
 * Build / Play Ground page (Figma 16-2956 / 16-3007 / 16-2783).
 * Content from Sanity only — no in-code seed fallback.
 */
export default function BuildBody({
  content,
}: {
  content: BuildContentData;
}) {
  const intro = content.intro;
  const buildProjects = content.projects;

  const [view, setView] = usePersistedView<View>(VIEWS, "txt");
  const [openId, setOpenId] = useState<string | null>(null);
  const { r, pin } = useReveal(view === "txt");

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const viewToggle = (
    <ViewToggle views={["txt", "img"] as const} value={view} onChange={switchView} />
  );

  return (
    <div className="relative">
      {/* Watermark: front→back reveal in ".txt", forced receded behind ".img". */}
      <BuildWatermark receded={view === "img"} />

      {view === "txt" ? (
        <>
          <div className={STICKY_UNDER_NAV}>
            <div
              style={{
                opacity,
                filter: blur,
                pointerEvents: r < 0.7 ? "none" : undefined,
              }}
              className="will-change-[opacity,filter]"
            >
              {viewToggle}
            </div>
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} py-8 lg:py-16`}>
              {/* Figma 16:3407 — portrait centered above prose on mobile. */}
              <div
                className={`flex flex-col items-center lg:sticky lg:items-stretch lg:self-start ${PORTRAIT_STICKY_TOP}`}
              >
                <h1 className="sr-only">Build/Play Ground</h1>
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
                className="relative z-10 mt-4 will-change-[opacity,filter,transform] lg:mt-0"
              >
                <BuildContent
                  className="pb-24"
                  intro={intro}
                  onOpenProject={setOpenId}
                />
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          {viewToggle}
          <main className="relative z-10 w-full pb-24 pt-8 lg:pt-12">
            <BuildGallery items={buildProjects} onOpen={setOpenId} />
          </main>
        </>
      )}

      <BuildProjectModal
        projects={buildProjects}
        openId={openId}
        onNavigate={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
