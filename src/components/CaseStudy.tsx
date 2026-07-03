"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  CaseStudyAccordionItem,
  CaseStudyGalleryView,
  CaseStudyStat,
  WorkProject,
} from "@/lib/content";

/**
 * Case-study renderer — an exact full-width copy of the live WordPress template
 * at faslebbie.com/case-studies/<slug> (custom twentynineteen theme). Section
 * order, top → bottom:
 *   1. Hero image + caption strip
 *   2. Overview (prose + Research & Design meta / full-height art)
 *   3. "What I Brought" — sage accordion
 *   4. "Problem Context" — black, centred
 *   5. "My Approach" + orange "Design Process" accordion (cream)
 *   6. "Design Interventions" — teal video band
 *   7. "Core Experience Flows" — tan, device tabs + grid + Load More
 *   8. "Empowering…" — maroon callout (image + label + body)
 *   9. "Research Outputs" — periwinkle grid + Load More
 *  10. Impact — white count-up stat band
 *  11. "Reflections & Impact" — black, centred
 *  12. "Next Steps" — white bullets + "Next up — {project}" image CTA
 *
 * Renders in two modes:
 *   - `variant="page"`    → a real, shareable route (/work/<slug>), normal flow.
 *   - `variant="overlay"` → an intercepted modal over /work (portal, fixed,
 *                            closes on Esc / × via `onClose`).
 *
 * Faithful to the live CSS: body = Reckless Neue; section titles (`sect_title`)
 * are small uppercase Helvetica labels; sizing is vw on desktop (xl:) with the
 * theme's px fallbacks below 1200px. Only authored projects (Coral Health)
 * render the full study; the rest degrade to hero + tagline.
 */

const SAGE = "#99B29D66";
const CREAM = "#FDE9CA";
const ORANGE = "rgba(255, 80, 5, 0.5)";
const TEAL = "#52747e";
const TAN = "rgba(164, 133, 110, 1)";
const MAROON = "#50242d";
const PERIWINKLE = "rgba(183, 198, 229, 1)";
const TILE = "#4f6b76";
const RED = "#e06164";
const SANS = "Helvetica, Arial, sans-serif";

export default function CaseStudy({
  project: p,
  prev,
  next,
  variant,
  onClose,
  onNavigate,
}: {
  project: WorkProject;
  prev: WorkProject;
  next: WorkProject;
  variant: "page" | "overlay";
  onClose?: () => void;
  // Overlay only: navigate to another study by REPLACING the URL (no new
  // history entry) so modals never stack and × always closes back to /work.
  onNavigate?: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlay = variant === "overlay";

  // Overlay only: Esc to close, lock the page behind, reset scroll on open.
  useEffect(() => {
    if (!overlay) return;
    scrollRef.current?.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [overlay, onClose, p.slug]);

  // Scroll reveal — faithful copy of the live faslebbie.com case-study script:
  // an IntersectionObserver tags each <section> with `.cs-active` (live: `.active`)
  // at a 0.1 threshold, and the `.cs-root` CSS rises/fades its children in. Once
  // revealed it stays revealed (the live site never un-tags), so we unobserve.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = root.querySelectorAll("section");
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((s) => s.classList.add("cs-active"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("cs-active");
            io.unobserve(entry.target);
          }
        }
      },
      // Overlay scrolls inside the popup panel, so observe relative to it;
      // the standalone page scrolls in the viewport (root = null).
      { threshold: 0.1, root: overlay ? root : null },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [p.slug]);

  const cs = p.caseStudy;
  const nextImg = next.caseStudy?.hero.image ?? next.image;

  // In the overlay, Prev/Next/Next-up REPLACE the URL (via onNavigate) instead
  // of pushing, so repeated paging never stacks modals/history and × closes
  // straight back to /work. The standalone page keeps normal <Link> pushes.
  const goTo = (slug: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(slug);
    }
  };

  const inner = (
    <>
      {/* Breadcrumb chrome (WIP3 1098:1602): sticky white bar with "Work / {name}"
          on the left (project underlined) and a × on the right. Overlay closes via
          onClose; the standalone page routes back to /work. */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-white px-6 py-3.5 xl:px-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-grotesk text-[15px] xl:text-[17px]">
          <Link href="/work" data-cursor="hover" className="text-black/55 transition-colors hover:text-black">
            Work
          </Link>
          <span aria-hidden className="text-black/35">/</span>
          <span aria-current="page" className="underline underline-offset-4">
            {p.name}
          </span>
        </nav>
        {overlay ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="font-grotesk text-[26px] leading-none text-black transition-transform hover:scale-110"
          >
            ×
          </button>
        ) : (
          <Link
            href="/work"
            aria-label="Close"
            data-cursor="hover"
            className="font-grotesk text-[26px] leading-none text-black transition-transform hover:scale-110"
          >
            ×
          </Link>
        )}
      </div>

      {cs ? (
        <>
          {/* 1 — Hero image + caption. */}
          <section className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
            <img
              src={cs.hero.image}
              alt={p.name}
              className="block h-auto max-h-screen w-full object-cover object-left"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute bottom-4 left-7.5 p-[10px] text-white">
              <p className="text-[16px] leading-[1.6] xl:text-[1.3vw]">
                <strong className="font-bold">{p.name}</strong> · {cs.hero.caption ?? p.tagline}
              </p>
            </div>
          </section>

          {/* 2 — Overview. */}
          {cs.overview && (
          <section className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-8 px-7.5 py-14 xl:py-[3.8rem]">
              <div>
                <Label>Overview</Label>
                <p className="mt-[1em] text-[18px] leading-[1.6] lg:leading-[1.2] xl:text-[1.4vw]">
                  {cs.overview.body}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 pt-12 sm:grid-cols-2 xl:pt-[10vw]">
                <div>
                  <Label>Research &amp; Design</Label>
                  <p className="mt-2 text-[16px] leading-normal xl:text-[0.95vw]">
                    {cs.overview.disciplines}
                  </p>
                </div>
                <ul className="space-y-2 text-[16px] leading-normal xl:text-[0.95vw]">
                  <li>
                    <span className="font-medium">Duration:</span> {cs.overview.duration}
                  </li>
                  <li>
                    <span className="font-medium">Team:</span> {cs.overview.team}
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative min-h-[60vw] bg-neutral-100 lg:min-h-0">
              {cs.overview.image && (
                // eslint-disable-next-line @next/next/no-img-element -- case-study art
                <img
                  src={cs.overview.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          </section>
          )}

          {/* 3 — What I brought (sage). */}
          {cs.brought && cs.brought.length > 0 && (
            <section className="py-[60px] xl:py-[5vw]" style={{ backgroundColor: SAGE }}>
              <div className="mx-auto w-full max-w-[1140px] px-[15px]">
                <div className="mx-auto max-w-[700px]">
                  <Label center>What I Brought</Label>
                  <div className="mt-6">
                    <Accordion items={cs.brought} variant="brought" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4 — Problem context (black). */}
          {cs.problem && (
            <section className="bg-black py-[60px] text-center text-white xl:py-[5vw]">
              <div className="mx-auto w-full max-w-[1140px] px-[15px]">
                <div className="mx-auto max-w-full lg:max-w-[60%]">
                  <Label center light>
                    Problem Context
                  </Label>
                  <div className="mt-6 space-y-5 text-[18px] leading-[1.4] xl:text-[1.25vw]">
                    {cs.problem.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 5 — My approach + orange Design Process accordion (cream). */}
          {cs.approach && (
            <section className="py-[60px] xl:py-[5vw]" style={{ backgroundColor: CREAM }}>
              <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 gap-10 px-[15px] lg:grid-cols-2 lg:gap-12">
                <div className="lg:self-end">
                  <Label>My Approach</Label>
                  <p className="mt-3 max-w-[90%] text-[18px] leading-normal lg:max-w-[80%] xl:text-[1.25vw]">
                    {cs.approach.blurb}
                  </p>
                </div>
                <div className="p-[10vw_5vw] xl:p-[2vw]" style={{ backgroundColor: ORANGE }}>
                  <Label center>Design Process</Label>
                  <div className="mt-4">
                    <Accordion items={cs.approach.process} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6 — Design interventions (teal video band). */}
          {cs.designInterventions && (
            <section style={{ backgroundColor: TEAL }}>
              {cs.designInterventions.video && (
                <div className="flex max-h-[80vh] justify-center overflow-hidden">
                  <video
                    className="h-auto max-h-[80vh] w-full object-contain"
                    src={cs.designInterventions.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              )}
              <div className="px-7.5 py-12 text-white xl:py-[3vw]">
                <Label light>Design Interventions</Label>
                <p className="mt-3 text-justify text-[18px] leading-[1.6] xl:text-[1.25vw]">
                  {cs.designInterventions.body}
                </p>
              </div>
            </section>
          )}

          {/* 7 — Core experience flows (tan, device tabs). */}
          {cs.coreFlows && (
            <section className="px-[15px] py-[60px] xl:py-[5vw]" style={{ backgroundColor: TAN }}>
              <div className="mb-2">
                <Label>{cs.coreFlows.heading}</Label>
                <p className="max-w-[70ch] text-[18px] leading-[1.6] xl:text-[1.25vw]">
                  {cs.coreFlows.body}
                </p>
              </div>
              <DeviceGallery views={cs.coreFlows.views} tile />
            </section>
          )}

          {/* 8 — Empowering callout (maroon). */}
          {cs.advocate && (
            <section style={{ backgroundColor: MAROON }}>
              {cs.advocate.image && (
                <div className="flex max-h-[80vh] justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    src={cs.advocate.image}
                    alt=""
                    className="h-auto max-h-[80vh] w-auto object-contain"
                  />
                </div>
              )}
              <div className="px-7.5 py-12 text-white xl:py-[3vw]">
                <Label light>{cs.advocate.heading}</Label>
                <p className="mt-3 text-[18px] leading-[1.6] xl:text-[1.25vw]">
                  {cs.advocate.body}
                </p>
              </div>
            </section>
          )}

          {/* 9 — Research outputs (periwinkle grid). */}
          {cs.researchOutputs && cs.researchOutputs.images.length > 0 && (
            <section
              className="px-[15px] py-[60px] xl:py-[5vw]"
              style={{ backgroundColor: PERIWINKLE }}
            >
              <div className="mb-2">
                <Label>{cs.researchOutputs.heading}</Label>
                <p className="max-w-[70ch] text-[18px] leading-[1.6] xl:text-[1.25vw]">
                  {cs.researchOutputs.body}
                </p>
              </div>
              <ImageGrid images={cs.researchOutputs.images} />
            </section>
          )}

          {/* 9b — Extra galleries captured from the live page (e.g. "Marketing
              & Brand", "Supporting Design Streams") so nothing is lost. */}
          {cs.extraGalleries?.map((g, i) => (
            <section key={i} className="px-[15px] py-[60px] xl:py-[5vw]">
              {(g.heading || g.body) && (
                <div className="mb-2">
                  {g.heading && <Label>{g.heading}</Label>}
                  {g.body && (
                    <p className="max-w-[70ch] text-[18px] leading-[1.6] xl:text-[1.25vw]">
                      {g.body}
                    </p>
                  )}
                </div>
              )}
              <ImageGrid images={g.images} />
            </section>
          ))}

          {/* 10 — Impact stat band (white, count-up). */}
          {cs.stats && cs.stats.length > 0 && (
            <section className="px-[15px] py-[60px] text-center xl:py-[5vw]">
              <div className="mx-auto grid max-w-[1140px] grid-cols-1 gap-12 sm:grid-cols-3">
                {cs.stats.map((s, i) => (
                  <Stat key={i} stat={s} />
                ))}
              </div>
            </section>
          )}

          {/* 11 — Reflections & Impact (black). */}
          {cs.reflections && (
            <section className="bg-black py-[60px] text-center text-white xl:py-[5vw]">
              <div className="mx-auto w-full max-w-[1140px] px-[15px]">
                <div className="mx-auto max-w-full lg:max-w-[60%]">
                  <Label center light>
                    Reflections &amp; Impact
                  </Label>
                  <div className="mt-6 space-y-5 text-[18px] leading-[1.4] xl:text-[1.25vw]">
                    {cs.reflections.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 12 — Next steps (white bullets). */}
          {cs.nextSteps && cs.nextSteps.length > 0 && (
            <section className="py-[60px] xl:py-[5vw]">
              <div className="mx-auto w-full max-w-[1140px] px-[15px]">
                <div className="mx-auto max-w-[640px]">
                  <Label>Next Steps</Label>
                  <ul className="mt-5 list-disc space-y-3 pl-5 text-[18px] leading-[1.6] xl:text-[1.1vw]">
                    {cs.nextSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="px-7.5 py-16">
          <Label>Overview</Label>
          <p className="mt-5 max-w-[760px] text-[24px] leading-snug">{p.tagline}.</p>
          <p className="mt-8" style={{ fontFamily: SANS }}>
            <span className="text-[14px] uppercase tracking-widest text-black/40">
              Full case study coming soon
            </span>
          </p>
        </section>
      )}

      {/* Next-up CTA — full-bleed image + black 75% overlay + big link.
          A real <Link>, so it deep-links to the next study (and re-intercepts
          as an overlay during client-side navigation). */}
      <Link
        href={`/work/${next.slug}`}
        onClick={goTo(next.slug)}
        data-cursor="hover"
        className="group relative block w-full overflow-hidden text-left"
      >
        {nextImg && (
          // eslint-disable-next-line @next/next/no-img-element -- next-up art
          <img src={nextImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative mx-auto w-full max-w-[1140px] px-[15px] py-[60px] xl:py-[5vw]">
          <span className="relative inline-block font-serif text-[34px] font-thin leading-[1.3] text-white/50 transition-[padding] duration-300 group-hover:pl-[2.5vw] xl:text-[5vw]">
            <span
              aria-hidden
              className="absolute left-0 top-1/2 z-[-1] size-[1.8vw] -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: RED }}
            />
            Next up- {next.name}
          </span>
        </div>
      </Link>

      {/* Sticky Previous / Next chrome (WIP3 1098:1602) — red, pinned to the modal
          bottom so it stays reachable while the study scrolls. The row itself is
          click-through; only the two links catch the pointer. */}
      <div className="pointer-events-none sticky bottom-0 z-50 py-5">
        <div className="pointer-events-none mx-auto flex max-w-[900px] items-center justify-between px-6 font-grotesk text-[18px] font-bold xl:text-[20px]" style={{ color: RED }}>
          <Link href={`/work/${prev.slug}`} onClick={goTo(prev.slug)} data-cursor="hover" className="pointer-events-auto transition-opacity hover:opacity-70">
            &lt; Previous
          </Link>
          <Link href={`/work/${next.slug}`} onClick={goTo(next.slug)} data-cursor="hover" className="pointer-events-auto transition-opacity hover:opacity-70">
            Next &gt;
          </Link>
        </div>
      </div>
    </>
  );

  if (overlay) {
    if (typeof document === "undefined") return null;
    // Centred pop-up modal over /work (WIP3 1098:1602, Israel 07/02: "it's not a
    // full page… the case study [sits] on top" of the works page). A soft cream
    // backdrop lets the works page show through around the edges; the white
    // panel is narrower + shorter than the viewport and scrolls internally, with
    // the breadcrumb bar sticky on top and Prev/Next at the bottom. Same content,
    // styling and scroll-reveal as the standalone page. Backdrop / Esc / × close.
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        onClick={onClose}
        className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(226,226,218,0.85)] p-3 sm:p-6 lg:p-10 animate-[panel-in_0.2s_ease-out]"
      >
        <div
          ref={scrollRef}
          onClick={(e) => e.stopPropagation()}
          className="cs-root relative h-full w-full max-w-[1200px] overflow-y-auto overflow-x-hidden overscroll-contain rounded-[12px] bg-white font-serif text-black shadow-2xl"
        >
          {inner}
        </div>
      </div>,
      document.body,
    );
  }
  return (
    <div ref={scrollRef} className="cs-root min-h-screen bg-white font-serif text-black">
      {inner}
    </div>
  );
}

/** Small uppercase Helvetica section label (the live `sect_title`). */
function Label({
  children,
  center,
  light,
}: {
  children: React.ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <h2
      style={{ fontFamily: SANS }}
      className={`mb-[20px] text-[20px] font-normal uppercase leading-tight xl:mb-[0.5vw] xl:text-[1vw] ${
        light ? "text-white" : "text-black"
      } ${center ? "text-center" : ""}`}
    >
      {children}
    </h2>
  );
}

/**
 * Live `.accordion_custom`: bottom-bordered rows, title left, +/- toggle on the
 * right, first item open. `brought` uses the larger "What I Brought" sizes.
 */
function Accordion({
  items,
  variant = "process",
}: {
  items: CaseStudyAccordionItem[];
  variant?: "brought" | "process";
}) {
  const [open, setOpen] = useState(0);
  const headSize = variant === "brought" ? "text-[18px] xl:text-[1.4vw]" : "text-[18px] xl:text-[1.05vw]";
  const bodySize = variant === "brought" ? "text-[16px] xl:text-[1.25vw]" : "text-[16px] xl:text-[0.9vw]";
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b-[0.4px] border-current">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              data-cursor="hover"
              className={`flex w-full items-center justify-between gap-6 py-[25px] text-left font-normal xl:py-[0.9vw] ${headSize}`}
            >
              <span>{it.title}</span>
              <span className="shrink-0 text-[35px] font-semibold leading-none xl:text-[2.5vw]">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (it.paras || it.bullets) && (
              <div className={`space-y-3 pb-6 leading-normal ${bodySize}`}>
                {it.paras?.map((para, j) => <p key={j}>{para}</p>)}
                {it.bullets && (
                  <ul className="list-disc space-y-3 pl-5">
                    {it.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Live `.change_view_block`: centred underlined uppercase text tabs. */
function DeviceGallery({ views, tile }: { views: CaseStudyGalleryView[]; tile?: boolean }) {
  const [active, setActive] = useState(0);
  const view = views[active];
  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-full flex-wrap justify-center gap-8 xl:gap-[6vw]">
        {views.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(i)}
            data-cursor="hover"
            style={{ fontFamily: SANS }}
            className={`relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 xl:text-[1vw] ${
              active === i ? "after:w-full" : "after:w-0 hover:after:w-full"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ImageGrid key={view.id} images={view.images} tile={tile} />
    </div>
  );
}

/** 2-column image grid + underlined "Load More" (matches the live grids). */
function ImageGrid({ images, tile }: { images: string[]; tile?: boolean }) {
  // Live `initializeGridView`: first 6 visible, "Load More" reveals +4.
  const INITIAL = 6;
  const STEP = 4;
  const [shown, setShown] = useState(INITIAL);
  const visible = images.slice(0, shown);
  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-x-[5vw] gap-y-10 sm:grid-cols-2">
        {visible.map((src, i) =>
          tile ? (
            <div
              key={i}
              className="p-[5vw] shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)] xl:p-[3vw_4vw]"
              style={{ backgroundColor: TILE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-[40vw] w-full object-contain xl:h-[20vw]"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- case-study art
            <img key={i} src={src} alt="" loading="lazy" className="block h-auto w-full object-cover" />
          ),
        )}
      </div>
      {shown < images.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            data-cursor="hover"
            style={{ fontFamily: SANS }}
            className="relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current xl:text-[1vw]"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}

/** Live `#user_impact`: huge count-up number + bold label + note. */
function Stat({ stat }: { stat: CaseStudyStat }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1500; // live: duration = 1500ms, linear floor
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur);
          setN(Math.floor(k * stat.value));
          if (k < 1) raf = requestAnimationFrame(tick);
          else setN(stat.value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat.value]);

  return (
    <div ref={ref} className="text-[16px] xl:text-[1.2vw]">
      <p className="flex justify-center text-[64px] leading-none xl:text-[8.5vw]">
        {n}
        {stat.suffix}
      </p>
      <p className="mt-4 block text-[20px] font-bold xl:text-[1.8vw]">{stat.label}</p>
      {stat.note && <p className="mt-2 leading-normal text-black/70">{stat.note}</p>}
    </div>
  );
}
