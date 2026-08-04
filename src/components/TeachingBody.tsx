"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import { useState } from "react";
import TeachingContent from "@/components/TeachingContent";
import TeachingGallery from "@/components/TeachingGallery";
import TeachingWatermark from "@/components/TeachingWatermark";
import ViewToggle from "@/components/ViewToggle";
import StudentModal from "@/components/StudentModal";
import ExhibitionOverlay from "@/components/ExhibitionOverlay";
import { students as fallbackStudents, teachingIntro, teachingSections } from "@/lib/teaching";
import type { TeachingContentData } from "@/lib/teachingFromSanity";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";

type View = "txt" | "img";

/**
 * Teaching / Pedagogy page (Figma 16-19731 / 16-22597 / 16-19360) — same
 * ".txt" / ".img" architecture as Work / Leadership / Build. ".txt" is the
 * pinned reveal (the "Teaching" watermark starts in front, portrait + prose
 * brighten forward) with red student links + two actions: "See all student
 * works" (→ ".img") and "Explore my student exhibitions" (→ the SFK Beijing
 * overlay). ".img" is a Student Works masonry + an SFK Exhibition masonry.
 * Student links / cards open the paged student modal. Mobile: no watermark /
 * pin / reveal — content sits settled.
 */
export default function TeachingBody({
  content,
}: {
  content?: TeachingContentData;
} = {}) {
  const intro = content?.intro ?? teachingIntro;
  const sections = content?.sections ?? teachingSections;
  const students = content?.students ?? fallbackStudents;
  const exhibitionTitle = content?.exhibitionTitle;
  const exhibitionTiles = content?.exhibitionTiles;

  const [view, setView] = useState<View>("txt");
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const [exhibitionOpen, setExhibitionOpen] = useState(false);
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
      <TeachingWatermark receded={view === "img"} />

      {view === "txt" ? (
        <>
          <div className="lg:sticky lg:top-[52px]">
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
            <main className="relative z-10 mx-auto grid w-full max-w-[1350px] grid-cols-1 gap-10 px-6 pb-12 pt-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-20">
              <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
                {/* Portrait only — "Teaching" wordmark is the background layer
                    (TeachingWatermark), sitting at the bottom of the photo on
                    mobile too (Figma 1:44550 / Fas 07/30). */}
                <h1 className="sr-only">Teaching</h1>
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
                <TeachingContent
                  className="pb-24"
                  intro={intro}
                  sections={sections}
                  onOpenStudent={setOpenStudent}
                  onSeeAllStudents={() => switchView("img")}
                  onOpenExhibition={() => setExhibitionOpen(true)}
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
            <TeachingGallery
              students={students}
              exhibitionTitle={exhibitionTitle}
              exhibitionTiles={exhibitionTiles}
              onOpenStudent={setOpenStudent}
              onOpenExhibition={() => setExhibitionOpen(true)}
            />
          </main>
        </>
      )}

      <StudentModal
        projects={students}
        openId={openStudent}
        onNavigate={setOpenStudent}
        onClose={() => setOpenStudent(null)}
      />

      <ExhibitionOverlay
        open={exhibitionOpen}
        title={exhibitionTitle}
        tiles={exhibitionTiles}
        onClose={() => setExhibitionOpen(false)}
        onViewStudents={() => {
          setExhibitionOpen(false);
          switchView("img");
        }}
      />
    </div>
  );
}
