"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import TeachingContent from "@/components/TeachingContent";
import TeachingGallery from "@/components/TeachingGallery";
import TeachingWatermark from "@/components/TeachingWatermark";
import ViewToggle from "@/components/ViewToggle";
import type { TeachingContentData } from "@/lib/teachingFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { usePersistedView } from "@/hooks/usePersistedView";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type View = "txt" | "img";
const VIEWS = ["txt", "img"] as const;

export default function TeachingBody({
  content,
}: {
  content: TeachingContentData;
}) {
  const { intro, sections, students, exhibitionTitle, exhibitionTiles } =
    content;

  const [view, setView] = usePersistedView<View>(VIEWS, "txt");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { r, pin } = useReveal(view === "txt");

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const seeAllStudents = () => {
    setView("img");
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "img");
    params.set("all", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  const viewToggle = (
    <ViewToggle views={["txt", "img"] as const} value={view} onChange={switchView} />
  );

  return (
    <div className="relative">
      <TeachingWatermark receded={view === "img"} />

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
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} pb-12 pt-8 lg:pb-16 lg:pt-20`}>
              <div className={`flex flex-col lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}>
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
                  onSeeAllStudents={seeAllStudents}
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
            />
          </main>
        </>
      )}
    </div>
  );
}
