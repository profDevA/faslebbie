"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  WORK_CREDIT,
  type WorkCategory,
  type WorkToken,
  toolStackLogos,
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

// Masonry card image heights per span tier (desktop) so the grid varies like
// Figma 823:65046.
const SPAN_H: Record<WorkProject["span"], string> = {
  sm: "h-[220px]",
  md: "h-[300px]",
  lg: "h-[380px]",
};

type WorkProject = (typeof workProjects)[number];

export default function WorkBody() {
  const router = useRouter();
  const [view, setView] = useState<View>("txt");
  // Reveal/pin (txt view only) — same transition as About/Home.
  const [r, setR] = useState(1);
  const [pin, setPin] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);

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

  // Split into the two 2-column groups that flank the centred FILTER WORK menu
  // (Figma 823:65046). Dealing in PAIRS keeps the top row matching the design:
  // [0,1] → left, [2,3] → right, [4,5] → left … so cols 1–2 sit left of the
  // menu and cols 3–4 sit right of it.
  const [leftProjects, rightProjects] = useMemo(() => {
    const left: WorkProject[] = [];
    const right: WorkProject[] = [];
    visible.forEach((p, i) => {
      (Math.floor(i / 2) % 2 === 0 ? left : right).push(p);
    });
    return [left, right];
  }, [visible]);

  // Soft-navigate to the case study. From /work this is intercepted into an
  // overlay (app/work/@modal/(.)[slug]); a direct visit renders the full page.
  const openProject = (slug: string) => router.push(`/work/${slug}`);

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
        className="cursor-pointer text-accent text-shadow-token underline decoration-2 underline-offset-2"
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
                  <div className="mt-3 flex items-center gap-[30px]">
                    <span className="font-serif text-[18px] tracking-[0.06em] text-black">
                      Stack:
                    </span>
                    <span className="flex flex-wrap items-center gap-x-[26px] gap-y-3 text-black">
                      {toolStackLogos.map((logo) => (
                        <span
                          key={logo.src}
                          className="inline-block shrink-0 bg-current"
                          style={{
                            width: `${logo.w * 0.75}px`,
                            height: `${logo.h * 0.75}px`,
                            WebkitMaskImage: `url(${logo.src})`,
                            maskImage: `url(${logo.src})`,
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                          }}
                        />
                      ))}
                    </span>
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
          {/* Desktop: 2 columns | centred FILTER WORK menu | 2 columns
              (Figma 823:65046 / 823:67611). */}
          <div className="hidden lg:flex lg:items-start lg:justify-center lg:gap-6 xl:gap-8">
            <div className="flex-1 gap-x-5 [column-fill:balance] columns-2 *:mb-7 *:break-inside-avoid">
              {leftProjects.map((p) => (
                <ProjectCard key={p.slug} project={p} onOpen={() => openProject(p.slug)} />
              ))}
            </div>

            {/* Centre menu: vertical tab when closed, category list when open. */}
            <div className="sticky top-[120px] flex shrink-0 justify-center self-start pt-[14vh]">
              {filterOpen ? (
                <div className="flex w-[200px] flex-col gap-3">
                  {(["All", ...workCategories] as Filter[]).map((cat) => {
                    const active = filter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        data-cursor="hover"
                        onClick={() => setFilter(cat)}
                        className={`flex items-center justify-between gap-6 font-grotesk text-[16px] transition-colors ${
                          active ? "font-bold text-accent" : "text-black hover:text-accent"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={active ? "text-accent" : "text-black/45"}>
                          {counts[cat]}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => setFilterOpen(false)}
                    className="mt-2 self-start font-grotesk text-[11px] uppercase tracking-[0.2em] text-black/40 transition-colors hover:text-black"
                  >
                    Close ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  data-cursor="hover"
                  aria-expanded={false}
                  className="font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70 [writing-mode:vertical-rl] transition-colors hover:text-black"
                  style={{ transform: "rotate(180deg)" }}
                >
                  Filter Work
                </button>
              )}
            </div>

            <div className="flex-1 gap-x-5 [column-fill:balance] columns-2 *:mb-7 *:break-inside-avoid">
              {rightProjects.map((p) => (
                <ProjectCard key={p.slug} project={p} onOpen={() => openProject(p.slug)} />
              ))}
            </div>
          </div>

          {/* Mobile / tablet: horizontal filter + single masonry. */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              data-cursor="hover"
              aria-expanded={filterOpen}
              className="mb-5 inline-flex items-center gap-2 font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70"
            >
              Filter Work <span className="text-accent">{filterOpen ? "−" : "+"}</span>
            </button>
            {filterOpen && (
              <div className="mb-8 flex flex-col gap-2 border-l-2 border-accent bg-close px-5 py-4">
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
            <div className="gap-x-5 [column-fill:balance] columns-1 sm:columns-2 *:mb-7 *:break-inside-avoid">
              {visible.map((p) => (
                <ProjectCard key={p.slug} project={p} onOpen={() => openProject(p.slug)} />
              ))}
            </div>
          </div>
        </main>
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
      {project.image ? (
        // Real card art (Figma 823:65046) at its natural aspect — true masonry.
        // eslint-disable-next-line @next/next/no-img-element -- static design asset
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          className="w-full"
        />
      ) : (
        // Branded colour placeholder until real art lands.
        <div
          className={`relative w-full overflow-hidden ${SPAN_H[project.span]}`}
          style={{
            backgroundImage: `radial-gradient(130% 130% at 30% 20%, ${project.accent} 0%, ${project.accent}cc 55%, ${project.accent}66 100%)`,
          }}
        >
          <span className="flex h-full w-full items-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="font-grotesk text-[13px] font-medium uppercase tracking-wide text-white/90">
              View project →
            </span>
          </span>
        </div>
      )}
      <p className="mt-2 font-grotesk text-[16px] font-bold leading-tight text-black underline-offset-2 group-hover:underline">
        {project.name}
      </p>
      <p className="mt-1 font-grotesk text-[13px] italic leading-snug text-black/55">
        {WORK_CREDIT}
      </p>
    </button>
  );
}
