"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import ProjectLightbox from "@/components/ProjectLightbox";
import {
  WORK_CREDIT,
  type WorkCategory,
  type WorkToken,
  toolStackImage,
  workCategories,
  workNarrative,
  workProjects,
} from "@/lib/content";
import {
  contentDrift,
  pinPx,
  portraitDrift,
  revealBlur,
  revealOpacity,
  revealProgress,
} from "@/lib/reveal";

type View = "txt" | "img";
type Filter = WorkCategory | "All";

const slugIndex = new Map(workProjects.map((p, i) => [p.slug, i]));

// Masonry card image heights per span tier (desktop) so the grid varies like
// Figma 823:65046.
const SPAN_H: Record<WorkProject["span"], string> = {
  sm: "h-[220px]",
  md: "h-[300px]",
  lg: "h-[380px]",
};

type WorkProject = (typeof workProjects)[number];

export default function WorkBody() {
  const [view, setView] = useState<View>("txt");
  // Reveal/pin (txt view only) — same transition as About/Home.
  const [r, setR] = useState(1);
  const [pin, setPin] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const mobile = window.innerWidth < 1024;
      const txt = view === "txt";
      setR(mobile || !txt ? 1 : revealProgress(window.scrollY, window.innerHeight));
      setPin(mobile || !txt ? 0 : pinPx(window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [view]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: workProjects.length };
    for (const cat of workCategories)
      c[cat] = workProjects.filter((p) => p.categories.includes(cat)).length;
    return c;
  }, []);

  const visible = useMemo(
    () =>
      filter === "All"
        ? workProjects
        : workProjects.filter((p) => p.categories.includes(filter)),
    [filter],
  );

  const openProject = (slug: string) => {
    const i = slugIndex.get(slug);
    if (i !== undefined) setLightbox(i);
  };

  // --- token renderer for the .txt narrative ---
  const renderToken = (tok: WorkToken, key: string) => {
    if (tok.t === "text") return <span key={key}>{tok.text}</span>;
    if (tok.t === "org")
      return (
        <span
          key={key}
          className="text-accent text-shadow-token underline decoration-2 underline-offset-2"
        >
          {tok.text}
        </span>
      );
    // project → red underlined, opens the lightbox.
    return (
      <span
        key={key}
        role="button"
        tabIndex={0}
        data-cursor="hover"
        onClick={() => openProject(tok.slug)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openProject(tok.slug);
          }
        }}
        className="cursor-pointer text-accent text-shadow-token underline decoration-2 underline-offset-2 transition-opacity duration-200 hover:opacity-70"
      >
        {tok.text}
      </span>
    );
  };

  return (
    <div className="relative">
      {/* ".txt / .img" view toggle (Figma 807:2954) — always sharp/clickable,
          centred near the top above the watermark + content. */}
      <div className="relative z-20 flex items-center justify-center gap-10 pt-9 lg:pt-12">
        {(["txt", "img"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => switchView(v)}
            data-cursor="hover"
            className={`font-grotesk text-[22px] font-medium leading-none text-black underline-offset-4 transition-opacity lg:text-[27px] ${
              view === v ? "underline" : "opacity-60 hover:opacity-100"
            }`}
          >
            .{v}
          </button>
        ))}
      </div>

      {view === "txt" ? (
        <>
          {/* Desktop pin: sticks under the nav for `pin` px of scroll so the
              content brightens in place before the page scrolls. */}
          <div className="lg:sticky lg:top-[52px]">
            <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-12 pt-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-20">
              <div className="flex flex-col gap-6 lg:sticky lg:top-[150px] lg:self-start">
                {/* Mobile heading + Stack (desktop uses the watermark block). */}
                <div className="lg:hidden">
                  <h1 className="font-grotesk text-[42px] font-bold uppercase leading-[1.1] text-black sm:text-[50px]">
                    Design Work
                  </h1>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="font-serif text-[18px] tracking-[0.06em] text-black">
                      Stack:
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static icon strip */}
                    <img
                      src={toolStackImage}
                      alt="Design tool stack"
                      className="h-[24px] w-auto opacity-80"
                    />
                  </div>
                </div>
                <Image
                  src="/portrait-about.png"
                  alt="Portrait of Fas Lebbie"
                  width={620}
                  height={684}
                  priority
                  style={{ opacity, filter: blur, transform: portraitDrift(r) }}
                  className="h-[299px] w-full bg-[#f0f0f0] object-cover object-top will-change-[opacity,filter,transform] lg:h-[299px] lg:w-[271px]"
                />
              </div>

              <div
                style={{
                  opacity,
                  filter: blur,
                  transform: contentDrift(r),
                  pointerEvents: r < 1 ? "none" : undefined,
                }}
                className="will-change-[opacity,filter,transform]"
              >
                <section className="pb-24 font-grotesk text-[26px] font-medium leading-normal tracking-[0.5px] text-black md:text-[32px] lg:text-[42px]">
                  {workNarrative.map((para, i) => (
                    <p key={i} className="mb-7">
                      {para.map((tok, j) => (
                        <Fragment key={j}>{renderToken(tok, `${i}-${j}`)}</Fragment>
                      ))}
                    </p>
                  ))}
                </section>
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-12">
          <div className="relative lg:pl-12">
            {/* Vertical "FILTER WORK" tab (Figma 823:65046/67611). */}
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              data-cursor="hover"
              aria-expanded={filterOpen}
              className="absolute left-0 top-0 hidden font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70 [writing-mode:vertical-rl] transition-colors hover:text-black lg:block"
              style={{ transform: "rotate(180deg)" }}
            >
              Filter Work
            </button>

            {/* Filter panel (Figma 823:67611) — category list with counts. */}
            {filterOpen && (
              <div className="mb-8 flex flex-col gap-2 border-l-2 border-accent bg-close px-5 py-4 lg:absolute lg:left-10 lg:top-0 lg:z-20 lg:mb-0 lg:w-[260px] lg:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                {(["All", ...workCategories] as Filter[]).map((cat) => {
                  const active = filter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-cursor="hover"
                      onClick={() => {
                        setFilter(cat);
                        setFilterOpen(false);
                      }}
                      className={`flex items-center justify-between gap-6 font-grotesk text-[17px] transition-colors ${
                        active ? "font-bold text-accent" : "text-black hover:text-accent"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={active ? "text-accent" : "text-black/50"}>
                        {counts[cat]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Masonry grid of project cards (CSS columns flow). */}
            <div className="gap-x-6 [column-fill:balance] sm:columns-2 lg:columns-3 *:mb-8 *:break-inside-avoid">
              {visible.map((p) => (
                <ProjectCard
                  key={p.slug}
                  project={p}
                  onOpen={() => openProject(p.slug)}
                />
              ))}
            </div>
          </div>
        </main>
      )}

      {lightbox !== null && (
        <ProjectLightbox
          projects={workProjects}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: WorkProject;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="hover"
      className="group block w-full text-left"
    >
      {/* Branded colour placeholder until real hero art lands. */}
      <div
        className={`w-full overflow-hidden ${SPAN_H[project.span]}`}
        style={{
          backgroundImage: project.image
            ? `url(${project.image})`
            : `radial-gradient(130% 130% at 30% 20%, ${project.accent} 0%, ${project.accent}cc 55%, ${project.accent}66 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="flex h-full w-full items-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="font-grotesk text-[13px] font-medium uppercase tracking-wide text-white/90">
            View project →
          </span>
        </span>
      </div>
      <p className="mt-2 font-grotesk text-[16px] font-bold leading-tight text-black underline-offset-2 group-hover:underline">
        {project.name}
      </p>
      <p className="mt-1 font-grotesk text-[13px] italic leading-snug text-black/55">
        {WORK_CREDIT}
      </p>
    </button>
  );
}
