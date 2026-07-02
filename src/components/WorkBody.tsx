"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
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
import WorkWatermark from "@/components/WorkWatermark";

type View = "txt" | "img";
type Filter = WorkCategory | "All";

// Masonry card image heights per span tier (desktop) so the grid varies like
// Figma 823:65046.
const SPAN_H: Record<WorkProject["span"], string> = {
  sm: "h-[220px]",
  md: "h-[300px]",
  lg: "h-[380px]",
};

// Per-column auto-scroll durations for the `.img` wall — deliberately different
// so each of the 4 columns drifts up at its own (slow) speed, like
// faslebbie.com/works. Higher = slower.
const WALL_SPEEDS = ["58s", "76s", "66s", "84s"];

// Width (px) of the expanded FILTER WORK menu. On open, the left column pair
// slides left by half this and the right pair slides right by half, opening a
// centred gap for the menu (Figma 1111:4653 / 1111:6992).
const WALL_MENU_W = 220;

type WorkProject = (typeof workProjects)[number];

export default function WorkBody() {
  const router = useRouter();
  const [view, setView] = useState<View>("txt");
  // Reveal/pin (txt view only) — same transition as About/Home.
  const [r, setR] = useState(1);
  const [pin, setPin] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Round-robin the visible projects into 4 columns for the auto-scroll wall.
  const wallColumns = useMemo(() => {
    const cols: WorkProject[][] = [[], [], [], []];
    visible.forEach((p, i) => cols[i % 4].push(p));
    return cols;
  }, [visible]);

  // Scroll-triggered reveal for the `.img` grid: each card fades up as it
  // enters the viewport (faslebbie.com/works fades on load, but our 17-card
  // grid is taller than one screen, so we tie it to scroll). Re-runs when the
  // view/filter changes (cards remount via their key and start hidden again).
  useEffect(() => {
    if (view !== "img") return;
    const root = gridRef.current;
    if (!root) return;
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-work-card]"),
    );
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      cards.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view, filter, visible]);

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

  // ".txt / .img" view toggle (Figma 807:2954) — always sharp/clickable, centred
  // near the top. It renders INSIDE the pinned wrapper (txt view) so the pin
  // engages right under the nav like About: the content is held in place and only
  // brightens until the watermark has fully receded, then the page scrolls.
  const viewToggle = (
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
  );

  return (
    <div className="relative">
      {/* "Design Work" wordmark. In ".txt" it does the front→back reveal on scroll;
          in ".img" it's forced to its receded (faint grey, behind) state so the grid
          always sits over a backdropped wordmark — like Figma — instead of snapping
          back to the front when switching views resets the scroll. */}
      <WorkWatermark receded={view === "img"} />
      {view === "txt" ? (
        <>
          {/* Desktop pin: sticks under the nav for `pin` px of scroll so the
              content brightens in place before the page scrolls. The toggle is
              inside the pinned wrapper so the pin engages immediately (no pre-pin
              scroll while the content is still dim), exactly like the About page. */}
          <div className="lg:sticky lg:top-[52px]">
            {/* The toggle is part of the dim back layer too: at the very top it's
                grayed out + blurred behind the wordmark and not clickable, then it
                brightens and goes live alongside the content (~70% revealed). */}
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
            <main className="relative z-10 mx-auto grid w-full max-w-[1288px] grid-cols-1 gap-10 px-6 pb-12 pt-8 lg:grid-cols-[auto_minmax(0,853px)] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-20">
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
                  // Enable clicks/hovers once the content has come forward of the
                  // wordmark (~70% revealed) rather than waiting for the pin to
                  // fully settle — so links like "Coral Health" work a touch early.
                  pointerEvents: r < 0.7 ? "none" : undefined,
                }}
                className="will-change-[opacity,filter,transform]"
              >
                <section className="pb-24 font-grotesk text-[26px] font-medium leading-normal tracking-[0.5px] text-black md:text-[32px] lg:text-[42px]">
                  {workNarrative.map((para, i) => (
                    // Figma separates paragraphs by a full blank line (~1 line-height,
                    // ~63px at 42px/1.5) — scale the gap with the responsive font size.
                    <p key={i} className="mb-[39px] md:mb-[48px] lg:mb-[63px]">
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
        <>
          {viewToggle}
          <main ref={gridRef} className="relative z-10 w-full pb-24 pt-10 lg:pb-0 lg:pt-4">
          {/* Desktop: 4 full-width auto-scroll columns (~25% each). FILTER WORK
              is a centred tab; on open the left pair slides left and the right
              pair slides right by half the menu width, opening a centred gap for
              the menu — columns keep their width and clip at the screen edges
              (Figma 1111:4653 closed / 1111:6992 open). */}
          <div className="relative hidden h-[calc(100vh-190px)] w-full overflow-hidden lg:block">
            <div className="flex h-full w-full gap-5 px-6">
              <div
                className="flex flex-1 gap-5 transition-transform duration-500 ease-out"
                style={{
                  transform: filterOpen ? `translateX(-${WALL_MENU_W / 2}px)` : undefined,
                }}
              >
                {[0, 1].map((ci) => (
                  <WallColumn
                    key={`${filter}-col-${ci}`}
                    col={wallColumns[ci]}
                    speed={WALL_SPEEDS[ci % WALL_SPEEDS.length]}
                    onOpen={openProject}
                  />
                ))}
              </div>
              <div
                className="flex flex-1 gap-5 transition-transform duration-500 ease-out"
                style={{
                  transform: filterOpen ? `translateX(${WALL_MENU_W / 2}px)` : undefined,
                }}
              >
                {[2, 3].map((ci) => (
                  <WallColumn
                    key={`${filter}-col-${ci}`}
                    col={wallColumns[ci]}
                    speed={WALL_SPEEDS[ci % WALL_SPEEDS.length]}
                    onOpen={openProject}
                  />
                ))}
              </div>
            </div>

            {/* Centred FILTER WORK — vertical tab (closed) / category list
                (open). When open a transparent backdrop closes on click. */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              {filterOpen && (
                <button
                  type="button"
                  aria-label="Close filter"
                  onClick={() => setFilterOpen(false)}
                  className="pointer-events-auto absolute inset-0 cursor-pointer"
                />
              )}
              {filterOpen ? (
                <div
                  className="work-filter-expand pointer-events-auto relative flex flex-col gap-3"
                  style={{ width: WALL_MENU_W }}
                >
                  {(["All", ...workCategories] as Filter[]).map((cat) => {
                    const active = filter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        data-cursor="hover"
                        onClick={() => setFilter(cat)}
                        className={`flex items-baseline justify-between gap-6 font-grotesk transition-all ${
                          active
                            ? "text-[24px] font-semibold text-accent"
                            : "text-[16px] text-black hover:text-accent"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={active ? "text-accent" : "text-black/45"}>
                          {counts[cat]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  data-cursor="hover"
                  aria-expanded={false}
                  className="pointer-events-auto font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70 [writing-mode:vertical-rl] transition-colors hover:text-black"
                  style={{ transform: "rotate(180deg)" }}
                >
                  Filter Work
                </button>
              )}
            </div>
          </div>

          {/* Mobile / tablet: horizontal filter + single masonry. */}
          <div className="px-6 lg:hidden">
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
              {visible.map((p, i) => (
                <ProjectCard
                  key={`${filter}-${p.slug}`}
                  project={p}
                  index={i}
                  onOpen={() => openProject(p.slug)}
                />
              ))}
            </div>
          </div>
          </main>
        </>
      )}
    </div>
  );
}

// One auto-scrolling column of the `.img` wall. Its cards are duplicated once
// so the CSS `-50%` loop is seamless; `speed` sets the drift duration.
function WallColumn({
  col,
  speed,
  onOpen,
}: {
  col: WorkProject[];
  speed: string;
  onOpen: (slug: string) => void;
}) {
  return (
    <div className="work-wall-col flex-1">
      <div className="work-wall-track" style={{ animationDuration: speed }}>
        {[...col, ...col].map((p, i) => (
          <div key={`${p.slug}-${i}`} className="mb-5">
            <ProjectCard project={p} reveal={false} onOpen={() => onOpen(p.slug)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
  index = 0,
  reveal = true,
}: {
  project: WorkProject;
  onOpen: () => void;
  index?: number;
  // When false (auto-scroll wall) the card is always visible — the column's
  // continuous drift is the animation, so no scroll-reveal is applied.
  reveal?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="hover"
      {...(reveal ? { "data-work-card": true } : {})}
      className={`${reveal ? "work-card-reveal " : ""}group block w-full text-left`}
      // Small repeating per-row stagger so cards cascade in as a group without
      // later cards waiting too long — mirrors the staggered fade on
      // faslebbie.com/works.
      style={reveal ? { transitionDelay: `${(index % 6) * 70}ms` } : undefined}
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
      <p className="mt-1 font-grotesk text-[13px] leading-snug text-black/55">
        {project.tagline}
      </p>
    </button>
  );
}
