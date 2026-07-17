"use client";

import Image from "next/image";
import { useState } from "react";
import MobileRecedeHeading from "@/components/MobileRecedeHeading";
import BuildContent from "@/components/BuildContent";
import BuildGallery from "@/components/BuildGallery";
import BuildProjectModal from "@/components/BuildProjectModal";
import BuildWatermark from "@/components/BuildWatermark";
import { buildProjects } from "@/lib/build";
import { contentDrift, portraitDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";

type View = "txt" | "img";

/**
 * Build / Play Ground page (Figma 16-2956 / 16-3007 / 16-2783) — same ".txt" /
 * ".img" architecture as Work + Leadership. ".txt" is the pinned reveal (the
 * "Build/Play Ground" watermark starts in front, the portrait + prose brighten
 * forward) with red project links; ".img" is a masonry of project cards. Both
 * the prose links and the cards open the paged project modal. Mobile: no
 * watermark / pin / reveal — content sits settled.
 */
export default function BuildBody() {
  const [view, setView] = useState<View>("txt");
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
    <div className="relative z-20 flex items-center justify-center gap-10 pt-9 lg:pt-12">
      {(["txt", "img"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => switchView(v)}
          data-cursor="hover"
          className={`font-grotesk text-[22px] font-medium leading-none text-black underline-offset-4 hover:underline lg:text-[27px] ${
            view === v ? "underline" : "no-underline"
          }`}
        >
          .{v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative">
      {/* Watermark: front→back reveal in ".txt", forced receded behind ".img". */}
      <BuildWatermark receded={view === "img"} />

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
              <div className="flex flex-col lg:sticky lg:top-[150px] lg:self-start">
                {/* Portrait sits top-left beside the wordmark and stays clear in
                    BOTH states (exempt from the reveal fade/blur; only the
                    subtle drift applies), matching Leadership. */}
                <Image
                  src="/portrait.png"
                  alt="Portrait of Fas Lebbie"
                  width={360}
                  height={299}
                  priority
                  style={{ transform: portraitDrift(r) }}
                  className="h-[360px] w-full bg-[#f0f0f0] object-cover object-top will-change-transform lg:h-[286px] lg:w-[260px]"
                />
                <MobileRecedeHeading className="mt-10 font-logo text-[42px] font-bold leading-[1.05] sm:text-[50px]">
                  Build/Play Ground
                </MobileRecedeHeading>
              </div>

              <div
                style={{
                  opacity,
                  filter: blur,
                  transform: contentDrift(r),
                  pointerEvents: r < 0.7 ? "none" : undefined,
                }}
                className="will-change-[opacity,filter,transform]"
              >
                <BuildContent className="pb-24" onOpenProject={setOpenId} />
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
