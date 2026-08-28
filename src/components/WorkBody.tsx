"use client";

import PagePortrait, { PORTRAIT_STICKY_TOP } from "@/components/PagePortrait";
import { LISTING_PORTRAIT_COLUMN_CLASS } from "@/lib/portraitLayout";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { type Testimonial, type WorkToken } from "@/lib/content";
import { workFromSanity } from "@/lib/workFromSanity";
import CaseStudyView from "@/components/CaseStudyView";
import { PopupTrigger } from "@/components/InlineToken";
import TestimonialsFooterLink from "@/components/TestimonialsFooterLink";
import type { Study, WorkPageConfig } from "@/sanity/types";
import { LISTING_GRID, LISTING_SHELL, STICKY_UNDER_NAV } from "@/lib/navLayout";
import {
  contentDrift,
  portraitDrift,
  revealBlur,
  revealOpacity,
} from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { usePersistedView } from "@/hooks/usePersistedView";
import { useAccessGate } from "@/hooks/useAccessGate";
import PasswordGate from "@/components/PasswordGate";
import ToolStack from "@/components/ToolStack";
import ViewToggle from "@/components/ViewToggle";
import WorkWatermark from "@/components/WorkWatermark";

type View = "txt" | "img";
type Filter = string;
const WORK_VIEWS = ["txt", "img"] as const;

// Masonry card image heights per span tier (desktop) so the grid varies like
// Figma 823:65046.
const SPAN_H: Record<"sm" | "md" | "lg", string> = {
  sm: "h-[220px]",
  md: "h-[300px]",
  lg: "h-[380px]",
};

// Per-column parallax multipliers for the `.img` wall. A single shared scroll
// offset (auto-advanced each frame AND nudged by the mouse wheel) is multiplied
// by these so the 4 columns drift at their own slightly-different speeds, like
// faslebbie.com/works — while still being manually scrollable (Israel 07/03).
const WALL_FACTORS = [0.75, 0.55, 0.65, 0.5];
const WALL_AUTO_SPEED = 0.9; // base px added to the shared offset each frame
const WALL_WHEEL_SCALE = 0.65; // how strongly the wheel scrolls the wall

// Size (px) of the expanded FILTER WORK menu. On open, the left column pair
// slides left by half WALL_MENU_W and the right pair slides right by half,
// opening a centred gap; WALL_MENU_INNER_W is the actual menu width so the gap
// keeps a little breathing room on each side (Figma 1111:4653 / 1111:6992,
// category list 1251:6335 — 207px wide, ~44px row pitch).
const WALL_MENU_W = 480;
const WALL_MENU_INNER_W = 207;
/** Mobile menu = desktop list width (Figma 2869:63796). Gap = this + 10px/side. */
const WALL_MENU_INNER_W_MOBILE = 207;
const WALL_MENU_W_MOBILE = WALL_MENU_INNER_W_MOBILE + 20;
// Closed state widens the centre gutter for the vertical "FILTER WORK" tab.
const WALL_TAB_LANE = 24;

type WorkProject = Study;

function matchesFilter(project: WorkProject, filter: Filter) {
  return filter === "All" || project.categories.includes(filter);
}

// Desktop wall columns are ~330px; 1200 covers ~3× DPR. Never request wider
// than the Sanity original — CDN upscale softens ~325px Figma exports further.
const CARD_IMAGE_MAX = 1200;
const CARD_IMAGE_SRCSET = [480, 960, CARD_IMAGE_MAX] as const;
const CARD_IMAGE_SIZES = "(min-width: 1024px) 22vw, 46vw";

function cardImage(url: string | undefined) {
  if (!url) {
    return {
      src: undefined,
      w: undefined,
      h: undefined,
      srcSet: undefined as string | undefined,
    };
  }
  const pathForDims = url.split("?")[0] ?? url;
  const m = /-(\d+)x(\d+)\.\w+$/.exec(pathForDims);
  const w = m ? Number(m[1]) : undefined;
  const h = m ? Number(m[2]) : undefined;

  if (!url.includes("cdn.sanity.io")) {
    return { src: url, w, h, srcSet: undefined };
  }

  const maxDeliver = w ? Math.min(CARD_IMAGE_MAX, w) : CARD_IMAGE_MAX;
  const quality = maxDeliver < 600 ? 92 : 88;

  const cdnUrl = (width: number) => {
    const rw = w ? Math.min(width, w) : width;
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("w", String(rw));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "max");
      parsed.searchParams.set("q", String(quality));
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const srcSetWidths = CARD_IMAGE_SRCSET.map((tw) =>
    w ? Math.min(tw, w) : tw,
  )
    .filter((tw, i, arr) => tw > 0 && arr.indexOf(tw) === i)
    .sort((a, b) => a - b);

  const srcSet =
    srcSetWidths.length > 1
      ? srcSetWidths.map((tw) => `${cdnUrl(tw)} ${tw}w`).join(", ")
      : undefined;

  return {
    src: cdnUrl(maxDeliver),
    w,
    h,
    srcSet,
  };
}

// Wrap-around previous/next for the in-page popup + Next-up band.
function neighbors(list: WorkProject[], slug: string) {
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  const n = list.length;
  return { project: list[i], prev: list[(i - 1 + n) % n], next: list[(i + 1) % n] };
}

export default function WorkBody({
  projects,
  categories,
  config,
  testimonials = [],
}: {
  projects: Study[];
  categories: string[];
  config?: WorkPageConfig | null;
  testimonials?: Testimonial[];
}) {
  // View availability + ".txt" narrative from the Work Page singleton (defaults
  // to both views on + in-code narrative when Sanity is empty).
  const work = workFromSanity(config);
  const textOn = work.enableTextView;
  const imgOn = work.enableImageView;
  const showToggle = textOn && imgOn;
  const bgColor = work.appearance?.backgroundColor?.hex;
  const narrative = work.narrative;
  const wordmarkTitle = work.sectionTitle?.trim() || "Design Work";

  // Aug 2026 — card / narrative clicks navigate to `/work/[slug]` (Coral template
  // QA on full page). Popup overlay code kept below until Fas signs off removal.
  const router = useRouter();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Persist .txt/.img in ?view= so a refresh stays on the same view (Fas 08/06).
  const [view, setView] = usePersistedView<View>(
    WORK_VIEWS,
    textOn ? "txt" : "img",
  );
  // Reveal/pin (txt view only) — same transition as About/Home. Latches at 1
  // on first completion so scrolling back up never replays it (Israel 07/02);
  // re-arms when toggling back to `.txt` (which scrolls to top).
  const { r, pin } = useReveal(view === "txt");
  // Committed filter (chip + grid blur after Apply). Pending = in-panel preview.
  const [appliedFilter, setAppliedFilter] = useState<Filter>("All");
  const [pendingFilter, setPendingFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );
  const gridRef = useRef<HTMLDivElement>(null);
  // `.img` wall auto/manual scroll: one shared offset drives column tracks
  // (via refs, mutated in rAF for perf — no re-render per frame).
  const wallWinRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const wallOffset = useRef(0);
  /** When set, ease wallOffset toward this value (filter scroll-to-top). */
  const wallScrollTarget = useRef<number | null>(null);
  const [popsNonce, setPopsNonce] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Auto-drift + wheel-driven manual scroll for the `.img` wall (mobile + desktop).
  // Finite: clamped to [0, maxOffset] so columns stop at the end (Israel 07/04).
  useEffect(() => {
    if (view !== "img") return;
    const win = wallWinRef.current;
    if (!win) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    wallOffset.current = 0; // always start the wall at its beginning

    // Per-column scrollable distance, and the shared-offset value at which the
    // deepest column bottoms out (offset * factor === colMax).
    const columnMax = (i: number) => {
      const track = trackRefs.current[i];
      if (!track) return 0;
      return Math.max(0, track.scrollHeight - win.clientHeight);
    };
    const maxOffset = () => {
      let m = 0;
      for (let i = 0; i < trackRefs.current.length; i++) {
        const f = WALL_FACTORS[i] ?? 0.6;
        if (f > 0) m = Math.max(m, columnMax(i) / f);
      }
      return m;
    };

    const apply = () => {
      const max = maxOffset();
      wallOffset.current = Math.min(Math.max(wallOffset.current, 0), max);
      const tracks = trackRefs.current;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (!track) continue;
        const y = Math.min(
          wallOffset.current * (WALL_FACTORS[i] ?? 0.6),
          columnMax(i),
        );
        track.style.transform = `translateY(${-y}px)`;
      }
    };

    const tick = () => {
      if (wallScrollTarget.current !== null) {
        const target = wallScrollTarget.current;
        const diff = target - wallOffset.current;
        if (Math.abs(diff) < 1) {
          wallOffset.current = target;
          wallScrollTarget.current = null;
        } else {
          wallOffset.current += diff * 0.15;
        }
      } else if (!reduce && wallOffset.current < maxOffset()) {
        wallOffset.current += WALL_AUTO_SPEED;
      }
      apply();
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const max = maxOffset();
      if (max <= 0) return;
      const goingDown = e.deltaY > 0;
      const atTop = wallOffset.current <= 0;
      const atBottom = wallOffset.current >= max - 0.5;
      if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
        e.preventDefault();
        wallOffset.current += e.deltaY * WALL_WHEEL_SCALE;
        apply();
      }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      touchY = y;
      if (maxOffset() <= 0) return;
      e.preventDefault();
      wallOffset.current += dy * 1.1;
      apply();
    };

    const ro = new ResizeObserver(() => apply());
    ro.observe(win);
    for (const track of trackRefs.current) {
      if (track) ro.observe(track);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    win.addEventListener("touchstart", onTouchStart, { passive: true });
    win.addEventListener("touchmove", onTouchMove, { passive: false });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      win.removeEventListener("touchstart", onTouchStart);
      win.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
    };
  }, [view, wide, projects.length]);

  // Reset scroll offset when column count changes — keep track refs intact.
  useEffect(() => {
    wallOffset.current = 0;
    wallScrollTarget.current = null;
  }, [wide]);

  // Ease wall to top when filter changes so matches (now first) are visible (Fas 08/12).
  useEffect(() => {
    if (view !== "img") return;
    wallScrollTarget.current = 0;
  }, [view, pendingFilter, appliedFilter]);

  const switchView = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    for (const cat of categories)
      c[cat] = projects.filter((p) => p.categories.includes(cat)).length;
    return c;
  }, [projects, categories]);

  // Preview blur while the panel is open; committed blur after Apply.
  const blurFilter = filterOpen ? pendingFilter : appliedFilter;

  // Round-robin: 4 columns desktop, 2 columns mobile. When filtered, matching
  // projects first then blurred non-matches (faslebbie.com/works — Fas 08/12).
  const wallColumns = useMemo(() => {
    const n = wide ? 4 : 2;
    const cols: WorkProject[][] = Array.from({ length: n }, () => []);
    const ordered =
      blurFilter === "All"
        ? projects
        : [
            ...projects.filter((p) => matchesFilter(p, blurFilter)),
            ...projects.filter((p) => !matchesFilter(p, blurFilter)),
          ];
    ordered.forEach((p, i) => cols[i % n].push(p));
    return cols;
  }, [projects, wide, blurFilter]);

  const bumpPops = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPopsNonce((n) => n + 1);
  };

  const selectPendingFilter = (cat: Filter) => {
    if (cat === pendingFilter) return;
    bumpPops();
    setPendingFilter(cat);
  };

  const openFilter = () => {
    setPendingFilter(appliedFilter);
    setFilterOpen(true);
  };

  const closeFilter = () => {
    if (pendingFilter !== appliedFilter) bumpPops();
    setPendingFilter(appliedFilter);
    setFilterOpen(false);
  };

  const applyFilter = () => {
    setAppliedFilter(pendingFilter);
    setFilterOpen(false);
  };

  const clearFilter = () => {
    if (appliedFilter === "All" && pendingFilter === "All") return;
    bumpPops();
    setAppliedFilter("All");
    setPendingFilter("All");
  };

  const showApply = filterOpen && pendingFilter !== appliedFilter;

  const menuShift =
    (filterOpen ? (wide ? WALL_MENU_W : WALL_MENU_W_MOBILE) : WALL_TAB_LANE) /
    2;
  const menuInnerW = wide ? WALL_MENU_INNER_W : WALL_MENU_INNER_W_MOBILE;

  // Scroll-triggered reveal for the `.img` grid: each card fades up as it
  // enters the viewport. Skipped after a filter change — those remounts use
  // PopsIn instead (same as faslebbie.com/works).
  useEffect(() => {
    if (view !== "img") return;
    if (popsNonce > 0) return;
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
  }, [view, wallColumns, popsNonce]);

  // Soft password gate for NDA studies (Fas 08/09). One unlock lasts the tab.
  const { gateOpen, requestAccess, closeGate, onGateSuccess } = useAccessGate();

  const goToStudy = (slug: string) => {
    const study = projects.find((p) => p.slug === slug);
    const nav = () => router.push(`/work/${slug}`);
    if (study?.passwordProtected) {
      requestAccess(nav);
      return;
    }
    nav();
  };

  // --- token renderer for the .txt narrative ---
  const renderToken = (tok: WorkToken, key: string) => {
    if (tok.t === "text") return <span key={key}>{tok.text}</span>;
    // Figma 838:74749 underlines the client names in red exactly like the
    // projects, so they keep that look even though there's no case study to open.
    if (tok.t === "org")
      return (
        <span
          key={key}
          className="text-accent underline decoration-from-font underline-offset-2"
        >
          {tok.text}
        </span>
      );
    // project → red underlined, opens the case study over the page.
    return (
      <PopupTrigger key={key} onClick={() => goToStudy(tok.slug)}>
        {tok.text}
      </PopupTrigger>
    );
  };

  // ".txt / .img" view toggle (Figma 807:2954) — always sharp/clickable, centred
  // near the top. It renders INSIDE the pinned wrapper (txt view) so the pin
  // engages right under the nav like About: the content is held in place and only
  // brightens until the watermark has fully receded, then the page scrolls.
  const viewToggle = (
    <ViewToggle views={["txt", "img"] as const} value={view} onChange={switchView} />
  );

  return (
    <div className="relative" style={bgColor ? { backgroundColor: bgColor } : undefined}>
      {/* "Design Work" wordmark. In ".txt" it does the front→back reveal on scroll;
          in ".img" it's forced to its receded (faint grey, behind) state so the grid
          always sits over a backdropped wordmark — like Figma — instead of snapping
          back to the front when switching views resets the scroll. */}
      <WorkWatermark receded={view === "img"} title={wordmarkTitle} />
      {view === "txt" ? (
        <>
          {/* Desktop pin: sticks under the nav for `pin` px of scroll so the
              content brightens in place before the page scrolls. The toggle is
              inside the pinned wrapper so the pin engages immediately (no pre-pin
              scroll while the content is still dim), exactly like the About page. */}
          <div className={STICKY_UNDER_NAV}>
            {/* The toggle is part of the dim back layer too: at the very top it's
                grayed out + blurred behind the wordmark and not clickable, then it
                brightens and goes live alongside the content (~70% revealed). */}
            {showToggle && (
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
            )}
            <main className={`relative z-10 ${LISTING_SHELL} ${LISTING_GRID} pb-12 pt-8 lg:pb-16 lg:pt-20`}>
              {/* Portrait column width = photo width so Stack wraps under it
                  (Figma 1:9885), not across the page over the watermark. */}
              <div
                className={`relative z-10 flex w-full max-w-full flex-col gap-5 ${LISTING_PORTRAIT_COLUMN_CLASS} lg:sticky lg:self-start ${PORTRAIT_STICKY_TOP}`}
              >
                <h1 className="sr-only">{wordmarkTitle}</h1>
                <PagePortrait
                  style={{ opacity, filter: blur, transform: portraitDrift(r) }}
                  className="relative z-10 !w-full will-change-[opacity,filter,transform]"
                />
                {/* Stack sits in the portrait column — must not bleed into prose. */}
                <div
                  style={{
                    opacity,
                    pointerEvents: r < 0.7 ? "none" : undefined,
                  }}
                  className="relative z-10 flex w-full max-w-full items-start gap-2 overflow-visible text-black will-change-[opacity]"
                >
                  <span className="shrink-0 pt-px font-grotesk text-[14px] font-medium leading-[1.35] tracking-[0.88px]">
                    Stack:
                  </span>
                  <div className="min-w-0 flex-1 overflow-visible">
                    <ToolStack
                      logos={work.toolStack.length ? work.toolStack : undefined}
                      perRow={work.toolStackPerRow}
                    />
                  </div>
                </div>
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
                className="relative z-10 mt-8 will-change-[opacity,filter,transform] lg:mt-0"
              >
                <section className="page-body-prose pb-24 text-black">
                  {narrative.map((para, i) => (
                    // Figma separates paragraphs by a full blank line (~1 line-height,
                    // ~63px at 42px/1.5) — scale the gap with the responsive font size.
                    <p key={i} className="mb-[39px] md:mb-[48px] lg:mb-[63px]">
                      {para.map((tok, j) => (
                        <Fragment key={j}>{renderToken(tok, `${i}-${j}`)}</Fragment>
                      ))}
                    </p>
                  ))}
                  {/* Fas 07/28: testimonials link at the bottom (same as About CV). */}
                  <TestimonialsFooterLink
                    testimonials={testimonials}
                    section="Work"
                    className="mt-4"
                  />
                </section>
              </div>
            </main>
          </div>
          <div aria-hidden className="hidden lg:block" style={{ height: pin }} />
        </>
      ) : (
        <>
          {showToggle && (
            <ViewToggle
              views={["txt", "img"] as const}
              value={view}
              onChange={switchView}
              className="max-lg:!pt-[43px]"
            />
          )}
          {appliedFilter !== "All" && !filterOpen && (
            <div className="relative z-10 flex items-center gap-[10px] px-2 pt-[55px] lg:px-6 lg:pt-1">
              <span className="font-grotesk text-[20px] tracking-[0.5px] text-black/50 lg:text-[24px]">
                {appliedFilter}
                <span className="ml-6 tabular-nums">{counts[appliedFilter]}</span>
              </span>
              <button
                type="button"
                data-cursor="hover"
                onClick={clearFilter}
                aria-label={`Clear ${appliedFilter} filter`}
                className="flex size-3 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-60 lg:size-[18px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                  className="size-full"
                >
                  <path
                    d="M0.832031 16.8324L8.83203 8.8324L16.832 0.832397M8.83203 8.8324L0.832031 0.832397L16.832 16.8324"
                    stroke="currentColor"
                    strokeWidth="1.66478"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}
          <main
            ref={gridRef}
            className={`relative z-10 w-full pb-0 lg:pt-4 ${appliedFilter !== "All" && !filterOpen ? "pt-5" : "pt-[62px]"}`}
          >
          {/* Shared wall (Figma mobile 1:17564 / 1:19168 + desktop 1111:4653):
              2 cols mobile / 4 desktop. On open, left slides left and right
              slides right — same Filter Work interaction on every breakpoint. */}
          <div
            ref={wallWinRef}
            className="relative h-[calc(100vh-150px)] w-full overflow-hidden lg:h-[calc(100vh-190px)]"
          >
            <div className="flex h-full w-full gap-2 px-2 lg:gap-5 lg:px-6">
              <div
                className="flex min-w-0 flex-1 gap-2 transition-transform duration-500 ease-out lg:gap-5"
                style={{ transform: `translateX(-${menuShift}px)` }}
              >
                {(wide ? [0, 1] : [0]).map((ci) => (
                  <WallColumn
                    key={`col-${ci}-${wide ? "d" : "m"}`}
                    col={wallColumns[ci] ?? []}
                    blurFilter={blurFilter}
                    popsNonce={popsNonce}
                    showMeta={wide}
                    trackRef={(el) => {
                      trackRefs.current[ci] = el;
                    }}
                    onOpen={goToStudy}
                  />
                ))}
              </div>
              <div
                className="flex min-w-0 flex-1 gap-2 transition-transform duration-500 ease-out lg:gap-5"
                style={{ transform: `translateX(${menuShift}px)` }}
              >
                {(wide ? [2, 3] : [1]).map((ci) => (
                  <WallColumn
                    key={`col-${ci}-${wide ? "d" : "m"}`}
                    col={wallColumns[ci] ?? []}
                    blurFilter={blurFilter}
                    popsNonce={popsNonce}
                    showMeta={wide}
                    trackRef={(el) => {
                      trackRefs.current[ci] = el;
                    }}
                    onOpen={goToStudy}
                  />
                ))}
              </div>
            </div>

            {categories.length > 0 && (
            <div className="pointer-events-none absolute inset-0 z-20">
              {filterOpen && (
                <button
                  type="button"
                  aria-label="Close filter"
                  onClick={closeFilter}
                  className="pointer-events-auto absolute inset-0 cursor-pointer"
                />
              )}
              {filterOpen ? (
                <div
                  className="work-filter-expand pointer-events-auto absolute left-1/2 top-[24px] flex -translate-x-1/2 flex-col items-stretch"
                  style={{ width: menuInnerW }}
                >
                  <button
                    type="button"
                    onClick={closeFilter}
                    data-cursor="hover"
                    aria-label="Close filter"
                    className="mb-[18px] hidden items-center justify-between gap-6 border-b border-black/15 pb-[14px] font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70 transition-colors hover:text-black lg:mb-[22px] lg:flex"
                  >
                    <span>Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden
                      className="shrink-0"
                    >
                      <path
                        d="M0.832031 16.8324L8.83203 8.8324L16.832 0.832397M8.83203 8.8324L0.832031 0.832397L16.832 16.8324"
                        stroke="currentColor"
                        strokeWidth="1.66478"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="flex flex-col gap-[8px]">
                    {(["All", ...categories] as Filter[]).map((cat) => {
                      const active = pendingFilter === cat;
                      const isAll = cat === "All";
                      return (
                        <button
                          key={cat}
                          type="button"
                          data-cursor="hover"
                          onClick={() => selectPendingFilter(cat)}
                          className={`flex w-full items-baseline justify-between gap-6 font-grotesk font-medium transition-colors ${
                            isAll
                              ? "text-[16px] uppercase leading-[19.2px]"
                              : "text-[20px] leading-[36px] tracking-[-0.225px]"
                          } ${
                            active
                              ? "text-accent"
                              : "text-black hover:text-accent"
                          }`}
                        >
                          <span>{isAll ? "ALL" : cat}</span>
                          <span className="tabular-nums">{counts[cat]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {showApply && (
                    <button
                      type="button"
                      data-cursor="hover"
                      onClick={applyFilter}
                      className="mx-auto mt-6 h-[37px] min-w-[175px] rounded-[35px] bg-black px-6 font-grotesk text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85 lg:mt-8 lg:h-[34px] lg:min-w-[120px] lg:rounded-[39px]"
                    >
                      Apply
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openFilter}
                  data-cursor="hover"
                  aria-expanded={false}
                  className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-black/70 [writing-mode:vertical-rl] transition-colors hover:text-black"
                >
                  Filter Work
                </button>
              )}
            </div>
            )}
          </div>
          </main>
        </>
      )}

      {/* Legacy in-page popup — unused while listing navigates to `/work/[slug]`. */}
      {openSlug &&
        (() => {
          const found = neighbors(projects, openSlug);
          if (!found) return null;
          return (
            <CaseStudyView
              project={found.project}
              prev={found.prev}
              next={found.next}
              variant="overlay"
              onClose={() => setOpenSlug(null)}
              onNavigate={goToStudy}
            />
          );
        })()}

      <PasswordGate
        open={gateOpen}
        message="Please enter your password."
        onClose={closeGate}
        onSuccess={onGateSuccess}
      />
    </div>
  );
}

// One column of the `.img` wall. The cards are NOT duplicated — the wall is
// finite (Israel 07/04: "it's endless… it needs to stop, it should have a
// beginning and an end"). `trackRef` exposes the track element so the parent's
// rAF/wheel loop can drive its translateY (auto-drift + manual scroll), clamped
// so it stops once the last card reaches the bottom of the window.
function WallColumn({
  col,
  blurFilter,
  popsNonce,
  trackRef,
  onOpen,
  showMeta = true,
}: {
  col: WorkProject[];
  blurFilter: Filter;
  popsNonce: number;
  trackRef: (el: HTMLDivElement | null) => void;
  onOpen: (slug: string) => void;
  showMeta?: boolean;
}) {
  return (
    <div className="work-wall-col flex-1">
      <div ref={trackRef} className="work-wall-track">
        {col.map((p) => (
          <div
            key={`${p.slug}-${popsNonce}`}
            className={`work-card-item mb-4 lg:mb-5${popsNonce > 0 ? " work-card-pops" : ""}`}
          >
            <ProjectCard
              project={p}
              dimmed={!matchesFilter(p, blurFilter)}
              reveal={false}
              showMeta={showMeta}
              onOpen={() => onOpen(p.slug)}
            />
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
  showMeta = true,
  dimmed = false,
}: {
  project: WorkProject;
  onOpen: () => void;
  index?: number;
  // When false (auto-scroll wall) the card is always visible — the column's
  // continuous drift is the animation, so no scroll-reveal is applied.
  reveal?: boolean;
  /** Mobile .img (Figma 1:17564) is image-only; desktop wall keeps title/From/To. */
  showMeta?: boolean;
  /** Non-matching filter preview / applied state — blur like faslebbie.com/works. */
  dimmed?: boolean;
}) {
  const accent = project.accent?.hex ?? "#999999";
  // The wall (reveal=false) is the first paint when `.img` opens, so load its
  // art eagerly; the mobile masonry (reveal=true) can lazy-load below the fold.
  const { src, w, h, srcSet } = cardImage(project.image);
  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="hover"
      aria-label={project.name}
      {...(reveal ? { "data-work-card": true } : {})}
      className={`${reveal ? "work-card-reveal " : ""}${dimmed ? "work-card-dimmed " : ""}group @container/card block w-full text-left`}
      // Small repeating per-row stagger so cards cascade in as a group without
      // later cards waiting too long — mirrors the staggered fade on
      // faslebbie.com/works.
      style={reveal ? { transitionDelay: `${(index % 6) * 70}ms` } : undefined}
    >
      {src ? (
        <div
          className="work-card-media"
          style={
            w && h
              ? { aspectRatio: `${w} / ${h}` }
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static design asset */}
          <img
            src={src}
            srcSet={srcSet}
            sizes={CARD_IMAGE_SIZES}
            width={w}
            height={h}
            alt={project.name}
            loading={reveal ? "lazy" : "eager"}
            fetchPriority={reveal ? "auto" : "high"}
            decoding="async"
            className={dimmed ? "opacity-0" : "opacity-100"}
          />
          <div
            className={`work-card-media-blur ${dimmed ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden
          />
        </div>
      ) : (
        // Branded colour placeholder until real art lands.
        <div
          className={`relative w-full overflow-hidden ${SPAN_H[project.span ?? "md"]}`}
          style={{
            backgroundImage: `radial-gradient(130% 130% at 30% 20%, ${accent} 0%, ${accent}cc 55%, ${accent}66 100%)`,
          }}
        >
          <span className="flex h-full w-full items-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="reckless-prose text-[13px] font-normal uppercase tracking-wide text-white/90">
              View project →
            </span>
          </span>
        </div>
      )}
      {showMeta && (
        <div className="work-card-meta reckless-prose">
          {/* Card meta (Figma 2080:31219) — desktop wall only. */}
          <p className="mt-2 w-fit text-[16px] font-normal leading-[1.35] text-black underline decoration-from-font [text-decoration-skip-ink:none] transition-colors group-hover:text-accent @[18rem]/card:text-[18px]">
            {project.name}
          </p>
          {(project.from || project.to) && (
            <p className="mt-2 grid grid-cols-1 text-[16px] font-normal italic leading-[1.35] text-black @[18rem]/card:grid-cols-[57%_1fr] @[18rem]/card:text-[18px]">
              <span>
                <span className="font-normal">From</span>: {project.from}
              </span>
              <span>
                <span className="font-normal">To</span>: {project.to}
              </span>
            </p>
          )}
        </div>
      )}
    </button>
  );
}

