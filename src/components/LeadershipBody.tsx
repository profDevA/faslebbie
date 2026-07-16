"use client";

import Image from "next/image";
import { useState } from "react";
import MobileRecedeHeading from "@/components/MobileRecedeHeading";
import LeadershipContent from "@/components/LeadershipContent";
import LeadershipGallery from "@/components/LeadershipGallery";
import LeadershipMomentPopup from "@/components/LeadershipMomentPopup";
import LeadershipWatermark from "@/components/LeadershipWatermark";
import { leadershipGallery } from "@/lib/content";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";

type View = "txt" | "img";

/**
 * Holistic Leadership page (Figma 1-44995 / 1-45057 / 1-45118) — same ".txt" /
 * ".img" architecture as Work. ".txt" is the pinned reveal (the "Leadership"
 * watermark starts in front, the portrait + prose brighten forward), with a red
 * "Explore my leadership moments" link that flips to ".img": a masonry of moment
 * cards that each open the unified image / name / role / testimonial popup.
 * Mobile: no watermark / pin / reveal — content sits settled.
 */
export default function LeadershipBody() {
  const [view, setView] = useState<View>("txt");
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

  // ".txt / .img" toggle — centred near the top, always the same colour, hover
  // adds the underline, the active view stays underlined (Israel 07/02).
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
      <LeadershipWatermark receded={view === "img"} />

      {view === "txt" ? (
        <>
          {/* Desktop pin: sticks under the nav so the content brightens in place
              before the page scrolls (same as About/Work). The toggle sits inside
              the dim back layer and only goes live once ~70% revealed. */}
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
                {/* Mobile (Figma 1-45348): portrait first, then the "Leadership"
                    heading that recedes on scroll. Desktop (Figma 1-44995 →
                    1-45057): the portrait sits top-left beside the wordmark and
                    stays clear in BOTH the top and reading states — so it's
                    exempt from the reveal fade/blur (only the subtle forward
                    drift applies); the prose still brightens in. */}
                <Image
                  src="/portrait.png"
                  alt="Portrait of Fas Lebbie"
                  width={360}
                  height={299}
                  priority
                  style={{ transform: portraitDrift(r) }}
                  className="h-[360px] w-full bg-[#f0f0f0] object-cover object-top will-change-transform lg:h-[286px] lg:w-[260px]"
                />
                <MobileRecedeHeading className="mt-10 font-logo text-[42px] font-bold leading-[1.1] sm:text-[50px]">
                  Leadership
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
                <LeadershipContent
                  className="pb-24"
                  onExplore={() => switchView("img")}
                />
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          {viewToggle}
          <main className="relative z-10 w-full pb-24 pt-6 lg:pt-10">
            <LeadershipGallery items={leadershipGallery} onOpen={setOpenId} />
          </main>
        </>
      )}

      <LeadershipMomentPopup
        items={leadershipGallery}
        openId={openId}
        onNavigate={setOpenId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
