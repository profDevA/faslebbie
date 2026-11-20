"use client";

import { useEffect, useMemo } from "react";
import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import BuildContent from "@/components/BuildContent";
import BuildGallery from "@/components/BuildGallery";
import BuildProjectModal from "@/components/BuildProjectModal";
import BuildWatermark from "@/components/BuildWatermark";
import ViewToggle from "@/components/ViewToggle";
import type { BuildContentData } from "@/lib/buildFromSanity";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import { contentDrift, portraitDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { useScrollTopOnMount } from "@/lib/useScrollTopOnMount";
import { usePersistedView } from "@/hooks/usePersistedView";
import { usePopupRoute } from "@/hooks/usePopupRoute";

type View = "txt" | "img";
const VIEWS = ["txt", "img"] as const;

export default function BuildBody({
  content,
  initialView = null,
  initialProject = null,
}: {
  content: BuildContentData;
  initialView?: string | null;
  initialProject?: string | null;
}) {
  const intro = content.intro;
  const buildProjects = content.projects;

  useScrollTopOnMount();
  const [view, setView] = usePersistedView<View>(
    VIEWS,
    "txt",
    undefined,
    initialView,
  );
  // Each project popup has an address, /build/<project> (Fas, Nov 19 QA: "I
  // don't see the URL changing for the build pages"): opening pushes it,
  // Previous / Next replace it, closing goes back to /build, Back closes.
  const projectIds = useMemo(() => buildProjects.map((p) => p.id), [buildProjects]);
  const { openId, open, navigate, close } = usePopupRoute(
    "/build",
    projectIds,
    initialProject && projectIds.includes(initialProject) ? initialProject : null,
    "/build",
  );
  // Old /build?project=<id> links still open the popup; show the clean address.
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("project");
    if (id && projectIds.includes(id)) {
      window.history.replaceState(null, "", `/build/${encodeURIComponent(id)}`);
    }
  }, [projectIds]);
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
                  onOpenProject={open}
                />
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          {viewToggle}
          <main className="relative z-10 w-full pb-24 pt-6 max-lg:pt-6 lg:pt-12">
            <BuildGallery items={buildProjects} onOpen={open} />
          </main>
        </>
      )}

      <BuildProjectModal
        projects={buildProjects}
        openId={openId}
        onNavigate={navigate}
        onClose={close}
      />
    </div>
  );
}
