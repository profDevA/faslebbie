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
const ORANGE = "rgba(255, 80, 5, 0.5)";
const TEAL = "#52747e";
const TAN = "rgba(164, 133, 110, 1)";
// Product-demo band. Matches the live site's `.desktop_screen_videos` section
// (background-color: #fe9d68); the original demo video plays full-width on it.
const PEACH = "#fe9d68";
// "EMPOWERING…" maroon band — matches the maroon baked into ch_bi.jpg-scaled.png
// so the portrait blends seamlessly into the band.
const MAROON = "#50242d";
const PERIWINKLE = "rgba(183, 198, 229, 1)";
const TILE = "#4f6b76";
const RED = "#e06164";
// Supporting Design Streams masonry (live #design_interventions_new /
// Figma 1099:14538): dark teal band with pale sage panels behind each mockup.
const FOREST = "#003545";
const SAGE_PANEL = "#d4e9d7";
const SANS = "Helvetica, Arial, sans-serif";

function isEmbedUrl(src: string) {
  return /youtu|vimeo|player\.|\/embed\//i.test(src);
}

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
  // and the `.cs-root` CSS rises/fades its children in. Once revealed it stays
  // revealed (the live site never un-tags), so we unobserve.
  //
  // Because sections are now full-modal-height (some taller than the viewport),
  // a positive ratio threshold is unreliable — a 1400px section inside an 814px
  // container can never reach a high ratio, and fast scrolls skip the crossing,
  // leaving content stuck at opacity 0. So we fire on ANY intersection
  // (threshold 0) with a small negative bottom margin so the reveal triggers as
  // the section rises into the lower part of the viewport. A scroll fallback
  // catches anything the observer misses.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll("section"));
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((s) => s.classList.add("cs-active"));
      return;
    }

    const reveal = (s: Element) => s.classList.add("cs-active");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      // Overlay scrolls inside the popup panel, so observe relative to it;
      // the standalone page scrolls in the viewport (root = null).
      { threshold: 0, rootMargin: "0px 0px -10% 0px", root: overlay ? root : null },
    );
    sections.forEach((s) => io.observe(s));

    // Fallback: on scroll, reveal any section whose top has passed 90% of the
    // scroll viewport. Guarantees no section is ever left invisible even if the
    // observer misses a fast scroll.
    const scroller: HTMLElement | Window = overlay ? root : window;
    const onScroll = () => {
      const vh = overlay ? root.clientHeight : window.innerHeight;
      const rootTop = overlay ? root.getBoundingClientRect().top : 0;
      for (const s of sections) {
        if (s.classList.contains("cs-active")) continue;
        const top = s.getBoundingClientRect().top - rootTop;
        if (top < vh * 0.9) reveal(s);
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [p.slug, overlay]);

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
          {overlay ? (
            // Clicking "Work" closes the popup back to the works page
            // (Israel 07/04 — "when you click on work here, you should go back").
            <button
              type="button"
              onClick={onClose}
              data-cursor="hover"
              className="text-black/55 transition-colors hover:text-black"
            >
              Work
            </button>
          ) : (
            <Link href="/work" data-cursor="hover" className="text-black/55 transition-colors hover:text-black">
              Work
            </Link>
          )}
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
          {/* 1 — Hero image + caption, at the image's natural height (exact copy
              of the live site — the hero does NOT fill the modal). */}
          <section className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
            <img
              src={cs.hero.image}
              alt={p.name}
              className="block h-auto w-full object-cover object-left"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute bottom-4 left-7.5 p-[10px] text-white">
              <p className="text-[16px] leading-[1.6] xl:text-[1.3vw]">
                <strong className="font-bold">{p.name}</strong> · {cs.hero.caption ?? p.tagline}
              </p>
            </div>
          </section>

          {/* 2 — Overview (Figma 1099:12527). LEFT column: Overview prose at the
              top, then the compact meta block (Research & Design / Duration /
              Team) below; the teal decorative portrait panel is on the RIGHT. */}
          {cs.overview && (
          <section data-cs-stretch className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-10 px-6 py-14 sm:px-10 xl:px-[3.5vw] xl:py-[3.8rem]">
              <div>
                <Label>Overview</Label>
                <p className="mt-[1em] text-[17px] leading-normal lg:leading-[1.3] xl:text-[1.15vw]">
                  {cs.overview.body}
                </p>
                {cs.overview.visitSite && (
                  <a
                    href={cs.overview.visitSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    style={{ fontFamily: SANS }}
                    className="mt-6 inline-block text-[13px] uppercase tracking-wide underline underline-offset-4 transition-colors hover:text-accent xl:text-[0.85vw]"
                  >
                    Visit Site
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-5">
                <div className="max-w-[340px]">
                  <Label>Research &amp; Design</Label>
                  <p className="mt-2 text-[13px] font-light leading-[1.35] xl:text-[0.95vw]">
                    {cs.overview.disciplines}
                  </p>
                </div>
                <div className="max-w-[340px] space-y-1 text-[13px] font-light leading-[1.35] xl:text-[0.95vw]">
                  <p>
                    <span className="font-normal">Duration</span>: {cs.overview.duration}
                  </p>
                  <p>
                    <span className="font-normal">Team</span>: {cs.overview.team}
                  </p>
                </div>
                {cs.overview.note && (
                  <p className="mt-4 max-w-[400px] text-[11px] italic leading-[1.4] text-black/55 xl:text-[0.78vw]">
                    {cs.overview.note}
                  </p>
                )}
              </div>
            </div>
            <div className="relative min-h-[70vw] bg-[#52747e] lg:min-h-full">
              {cs.overview.image && (
                // eslint-disable-next-line @next/next/no-img-element -- case-study art
                <img
                  src={cs.overview.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain object-center"
                />
              )}
            </div>
          </section>
          )}

          {/* 3 — What I brought (sage), narrow centred column (Figma 1099:12578). */}
          {cs.brought && cs.brought.length > 0 && (
            <section className="py-[60px] xl:py-[5vw]" style={{ backgroundColor: SAGE }}>
              <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
                <div className="mx-auto max-w-[480px]">
                  <Label center>{cs.broughtHeading ?? "What I Brought"}</Label>
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
              <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
                <div className="mx-auto max-w-full lg:max-w-[60%]">
                  <Label center light>
                    {cs.problemHeading ?? "Problem Context"}
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

          {/* 5 — My approach + orange Design Process accordion (Figma 1099:12599).
              Sage background; the "My Approach" copy is anchored to the BOTTOM of
              the left column while the orange Design Process panel stretches the
              full section height on the right. */}
          {cs.approach && (
            <section
              data-cs-stretch
              className="grid grid-cols-1 gap-10 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:gap-12 lg:grid-rows-[1fr] xl:px-[3.5vw] xl:py-[3.8rem]"
              style={{ backgroundColor: SAGE }}
            >
              <div className="flex flex-col justify-end">
                <div className="max-w-[445px]">
                  <Label>My Approach</Label>
                  <p className="mt-3 text-[18px] leading-normal xl:text-[1.25vw]">
                    {cs.approach.blurb}
                  </p>
                </div>
              </div>
              <div
                className="self-stretch p-[10vw_5vw] xl:p-[2vw]"
                style={{ backgroundColor: ORANGE }}
              >
                <Label center>Design Process</Label>
                <div className="mt-4">
                  <Accordion items={cs.approach.process} />
                </div>
              </div>
            </section>
          )}

          {/* 6 — Design interventions. Two live variants:
              - Cover-flow slider (Galderma `#design_interventions.center_slide`):
                black band, 5-up centered carousel, copy below.
              - Phone/video band (Coral): teal, media top, copy bottom-right. */}
          {cs.designInterventions &&
            (cs.designInterventions.slider && cs.designInterventions.slider.length > 0 ? (
              <section
                data-cs-stretch
                className="flex flex-col justify-center gap-10 bg-black py-14 text-white"
              >
                <CenterSlider images={cs.designInterventions.slider} />
                <div className="w-full max-w-[50%] px-[5vw] py-[3vw] text-justify">
                  <Label light>
                    {cs.designInterventions.heading ?? "Design Interventions"}
                  </Label>
                  <p className="mt-3 text-[13px] leading-normal xl:text-[0.9vw]">
                    {cs.designInterventions.body}
                  </p>
                </div>
              </section>
            ) : (
              <section
                data-cs-stretch
                className="flex flex-col gap-10 px-6 py-16 sm:px-10 xl:px-[3.5vw]"
                style={{ backgroundColor: TEAL }}
              >
                {cs.designInterventions.video && (
                  <div className="flex justify-center">
                    <video
                      className="h-auto w-[240px] max-w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:w-[262px]"
                      src={cs.designInterventions.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                )}
                <div className="mt-auto ml-auto w-full max-w-[360px] text-white">
                  <Label light>
                    {cs.designInterventions.heading ?? "Design Interventions"}
                  </Label>
                  <p className="mt-3 text-[13px] leading-normal xl:text-[0.9vw]">
                    {cs.designInterventions.body}
                  </p>
                </div>
              </section>
            ))}

          {/* 7 — Core experience flows (tan, device tabs). */}
          {cs.coreFlows && (
            <section className="px-6 sm:px-10 xl:px-[3.5vw] py-[60px] xl:py-[5vw]" style={{ backgroundColor: TAN }}>
              <div className="mb-2">
                <Label>{cs.coreFlows.heading}</Label>
                <p className="max-w-[70ch] text-[18px] leading-[1.6] xl:text-[1.25vw]">
                  {cs.coreFlows.body}
                </p>
              </div>
              <DeviceGallery views={cs.coreFlows.views} tile />
            </section>
          )}

          {/* 8 — Peach desktop-video band (live `.desktop_screen_videos`):
              Coral-Healthe_Video-3.mp4 full-width, with the live content_side
              copy ("Marketing & Brand Experience Designs") below, right-aligned.
              Next section on the live page is Supporting Design Streams. */}
          {cs.productDemo && (
            <section
              data-cs-stretch
              className="flex flex-col justify-center gap-10 py-16"
              style={{ backgroundColor: PEACH }}
            >
              {cs.productDemo.video && isEmbedUrl(cs.productDemo.video) ? (
                <div className="mx-auto grid w-full max-w-[1140px] gap-6 px-6 sm:grid-cols-2 sm:px-10 xl:grid-cols-3 xl:px-[3.5vw]">
                  {(cs.productDemo.embeds ?? [cs.productDemo.video]).map((src) => (
                    <div key={src} className="aspect-video w-full overflow-hidden bg-black/10">
                      <iframe
                        src={src}
                        title={cs.productDemo!.heading}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              ) : cs.productDemo.video ? (
                <video
                  className="block h-auto w-full"
                  src={cs.productDemo.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                cs.productDemo.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- case-study art
                  <img src={cs.productDemo.image} alt="" className="block h-auto w-full" />
                )
              )}
              <div className="ml-auto w-full max-w-[440px] px-6 text-black sm:px-10 xl:px-[3.5vw]">
                <Label>{cs.productDemo.heading}</Label>
                <p className="mt-3 text-[12px] leading-[1.45] xl:text-[0.85vw]">
                  {cs.productDemo.body}
                </p>
              </div>
            </section>
          )}

          {/* 9 — Supporting Design Streams (and any other extra galleries).
              Live order: immediately after the peach desktop video, before
              "Empowering…". The 'mockups' variant is Figma 1099:14538. */}
          {cs.extraGalleries?.map((g, i) =>
            g.variant === "mockups" ? (
              <MockupMasonry key={i} heading={g.heading} body={g.body} images={g.images} />
            ) : (
              <section key={i} className="px-6 sm:px-10 xl:px-[3.5vw] py-[60px] xl:py-[5vw]">
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
            ),
          )}

          {/* 10 — Empowering callout (Figma 1099:14539): maroon band with the
              portrait (its maroon + "z" swoosh baked in) centred, and the
              "EMPOWERING…" label + copy pinned bottom-right. The band colour
              matches the portrait's baked maroon so it blends seamlessly. Live
              order: after "Supporting Design Streams", before Research Outputs. */}
          {cs.advocate && (
            <section
              data-cs-stretch
              className="flex flex-col justify-center gap-8 py-14"
              style={{ backgroundColor: MAROON }}
            >
              {cs.advocate.video && isEmbedUrl(cs.advocate.video) ? (
                <div className="mx-auto grid w-full max-w-[1140px] gap-6 px-6 sm:grid-cols-2 sm:px-10 xl:grid-cols-3 xl:px-[3.5vw]">
                  {(cs.advocate.embeds ?? [cs.advocate.video]).map((src) => (
                    <div key={src} className="aspect-video w-full overflow-hidden bg-black/20">
                      <iframe
                        src={src}
                        title={cs.advocate!.heading || "Video"}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              ) : cs.advocate.video ? (
                <video
                  className="mx-auto block h-auto w-full max-w-[760px]"
                  src={cs.advocate.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                cs.advocate.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- case-study art
                  <img
                    src={cs.advocate.image}
                    alt=""
                    className="mx-auto block h-auto w-full max-w-[760px]"
                  />
                )
              )}
              {(cs.advocate.heading || cs.advocate.body) && (
                <div className="ml-auto w-full max-w-[540px] px-6 text-white sm:px-10 xl:px-[3.5vw]">
                  {cs.advocate.heading ? (
                    <Label light>{cs.advocate.heading}</Label>
                  ) : null}
                  {cs.advocate.body ? (
                    <p className="mt-3 text-[12px] leading-[1.45] xl:text-[0.85vw]">
                      {cs.advocate.body}
                    </p>
                  ) : null}
                </div>
              )}
            </section>
          )}

          {/* 11 — Research outputs (periwinkle grid). */}
          {cs.researchOutputs && cs.researchOutputs.images.length > 0 && (
            <section
              className="px-6 sm:px-10 xl:px-[3.5vw] py-[60px] xl:py-[5vw]"
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

          {/* 10 — Impact stat band (white, count-up). */}
          {cs.stats && cs.stats.length > 0 && (
            <section className="px-6 sm:px-10 xl:px-[3.5vw] py-[60px] text-center xl:py-[5vw]">
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
              <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
                <div className="mx-auto max-w-full lg:max-w-[60%]">
                  <Label center light>
                    {cs.reflectionsHeading ?? "Reflections & Impact"}
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
              <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
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

      {/* Next-up CTA — live `#case_footer.has-overlay`: full viewport height
          (100cqh in the modal / 100vh on the page), next project's hero as a
          cover image under a 75% black overlay, and the "Next up- {name}" link
          with the live character-fill + red-dot hover animation. */}
      <NextUp
        next={next}
        image={nextImg}
        onNavigate={onNavigate}
        scrollRoot={overlay ? scrollRef : undefined}
      />

      {/* Sticky Previous / Next chrome (Figma 1262:20851) — a full-width WHITE bar
          pinned to the modal bottom with red bold links, so it stays reachable
          while the study scrolls. */}
      <div className="sticky bottom-0 z-50 border-t border-black/10 bg-white py-5">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 font-grotesk text-[18px] font-bold xl:text-[20px]" style={{ color: RED }}>
          <Link href={`/work/${prev.slug}`} onClick={goTo(prev.slug)} data-cursor="hover" className="transition-opacity hover:opacity-70">
            &lt; Previous
          </Link>
          <Link href={`/work/${next.slug}`} onClick={goTo(next.slug)} data-cursor="hover" className="transition-opacity hover:opacity-70">
            Next &gt;
          </Link>
        </div>
      </div>
    </>
  );

  if (overlay) {
    if (typeof document === "undefined") return null;
    // Centred pop-up modal over /work (Figma 1262:6021). A 1098px-wide white card
    // with SHARP corners floats over the works page, which stays visible but
    // dimmed behind a cream scrim (Figma scrim 1262:6038 = rgba(226,226,218,0.8),
    // the same tint as the testimonials modal) — NOT an opaque white page. The
    // panel scrolls internally, breadcrumb bar sticky on top, Prev/Next at the
    // bottom. Same content, styling and scroll-reveal as the standalone page.
    // Backdrop / Esc / × close.
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 top-13 z-100 flex items-start justify-center bg-[rgba(226,226,218,0.8)] px-4 pb-8 pt-8 sm:px-6 lg:pt-[30px] animate-[panel-in_0.2s_ease-out]"
      >
        <div
          ref={scrollRef}
          onClick={(e) => e.stopPropagation()}
          className="cs-root cs-fullheight relative h-full max-h-[814px] w-full max-w-[1098px] overflow-y-auto overflow-x-hidden overscroll-contain bg-white font-serif text-black shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-black/10"
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

/** Live Galderma `#design_interventions.center_slide` — Slick centerMode
 *  cover-flow: track slides smoothly left/right, 5 slides visible (3 / 1 on
 *  smaller breakpoints), center card scaled + undimmed, white prev/next arrows
 *  pinned top-right. Autoplay every 6s; center image pans top→bottom. */
function CenterSlider({ images }: { images: string[] }) {
  const n = images.length;
  const [visible, setVisible] = useState(5);
  // Index into the tripled track; start in the middle copy so we can move either way.
  const [index, setIndex] = useState(() => Math.max(n, 0));
  const [noAnim, setNoAnim] = useState(false);
  const locked = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w < 575 ? 1 : w < 992 ? 3 : 5);
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Re-measure once mounted / when the modal opens.
  useEffect(() => {
    if (!viewportRef.current) return;
    setViewportW(viewportRef.current.clientWidth);
    const ro = new ResizeObserver(() => {
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth);
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const go = (dir: 1 | -1) => {
    if (locked.current || n < 2) return;
    locked.current = true;
    setIndex((i) => i + dir);
    window.setTimeout(() => {
      locked.current = false;
    }, 820);
  };

  // After sliding into a clone copy, snap back to the middle copy with no
  // animation so the loop feels infinite (Slick-style).
  useEffect(() => {
    if (n < 1) return;
    if (index >= 2 * n || index < n) {
      const t = window.setTimeout(() => {
        setNoAnim(true);
        setIndex((i) => (i >= 2 * n ? i - n : i < n ? i + n : i));
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setNoAnim(false));
        });
      }, 800);
      return () => window.clearTimeout(t);
    }
  }, [index, n]);

  useEffect(() => {
    if (n < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (locked.current) return;
      locked.current = true;
      setIndex((i) => i + 1);
      window.setTimeout(() => {
        locked.current = false;
      }, 820);
    }, 6000);
    return () => window.clearInterval(id);
  }, [n]);

  const loop = n > 0 ? [...images, ...images, ...images] : [];
  // Equal slide width + equal side gap (live 1.5vw). Center only scales up —
  // no extra margin, so every card shares the same base size and the active
  // one stays geometrically centered.
  const gapPx = viewportW > 0 ? viewportW * 0.015 : 0;
  const slideW = viewportW > 0 ? viewportW / visible : 0;
  // Shift so the active slide's midpoint sits at the viewport midpoint.
  const translateX =
    viewportW > 0 ? viewportW / 2 - (index + 0.5) * slideW : 0;
  const realIdx = n > 0 ? ((index % n) + n) % n : 0;

  return (
    <div className="cs-center-slider relative w-full pt-[3.5vw] pb-[3vw]">
      {/* White prev / next — live: absolute above the track, top-right */}
      <div className="pointer-events-none absolute top-0 right-[3vw] z-10 flex items-center gap-[1.5vw]">
        <button
          type="button"
          aria-label="Previous slide"
          data-cursor="hover"
          onClick={() => go(-1)}
          className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img
            src="/work/slider-arrows.svg"
            alt=""
            className="h-[0.85vw] min-h-[8px] w-[2vw] min-w-[19px] -scale-x-100 brightness-0 invert"
          />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          data-cursor="hover"
          onClick={() => go(1)}
          className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img
            src="/work/slider-arrows.svg"
            alt=""
            className="h-[0.85vw] min-h-[8px] w-[2vw] min-w-[19px] brightness-0 invert"
          />
        </button>
      </div>

      {/* overflow-x only — vertical overflow stays visible so scale(1.15) isn't clipped */}
      <div ref={viewportRef} className="overflow-x-hidden overflow-y-visible py-[2vw]">
        <div
          className="flex items-center"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: noAnim ? "none" : "transform 800ms ease-in-out",
            willChange: "transform",
          }}
        >
          {loop.map((src, i) => {
            const isCtr = i === index;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`Slide ${(i % n) + 1}`}
                aria-current={isCtr ? "true" : undefined}
                onClick={() => {
                  if (i === index || locked.current || n < 1) return;
                  const target = Math.floor(index / n) * n + (i % n);
                  locked.current = true;
                  setIndex(target);
                  window.setTimeout(() => {
                    locked.current = false;
                  }, 820);
                }}
                data-cursor="hover"
                className="relative shrink-0 overflow-visible bg-transparent p-0"
                style={{
                  width: slideW > 0 ? `${slideW}px` : `${100 / visible}%`,
                  paddingLeft: gapPx,
                  paddingRight: gapPx,
                  zIndex: isCtr ? 2 : 1,
                }}
              >
                {/* Same 2:3 frame for every slide; center only scales up */}
                <div
                  className="relative w-full overflow-hidden pt-[150%] transition-transform duration-800 ease-in-out"
                  style={{ transform: isCtr ? "scale(1.15)" : "scale(1)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    key={isCtr ? `c-${realIdx}` : `s-${i}`}
                    src={src}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover object-top ${
                      isCtr ? "cs-center-pan" : ""
                    }`}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
                    style={{ opacity: isCtr ? 0 : 0.85 }}
                    aria-hidden
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Live `#case_footer` — full-height "Next up" band. When it enters view the
 *  title fills character-by-character from dim white → solid white (live
 *  `animateCharacterFill`). Hover shifts the title right and reveals a red
 *  dot behind the first letter, matching faslebbie.com. */
function NextUp({
  next,
  image,
  onNavigate,
  scrollRoot,
}: {
  next: WorkProject;
  image?: string;
  onNavigate?: (slug: string) => void;
  scrollRoot?: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const label = `Next up- ${next.name}`;

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      textEl.textContent = label;
      textEl.style.color = "#ffffff";
      return;
    }

    const FILL_MS = 3000;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      textEl.textContent = label;
      textEl.style.color = "";
    };

    const fill = () => {
      reset();
      textEl.innerHTML = "";
      const chars = label.split("");
      const step = FILL_MS / Math.max(chars.length, 1);
      chars.forEach((ch, i) => {
        const span = document.createElement("span");
        span.textContent = ch;
        span.style.color = "rgba(255,255,255,0.2)";
        span.style.transition = "color 0.5s ease";
        textEl.appendChild(span);
        timers.push(
          setTimeout(() => {
            span.style.color = "#ffffff";
          }, i * step),
        );
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) fill();
          else reset();
        }
      },
      {
        threshold: 0.3,
        root: scrollRoot?.current ?? null,
      },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [label, scrollRoot, next.slug]);

  const go = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(next.slug);
    }
  };

  return (
    <section
      ref={sectionRef}
      data-cs-stretch
      className="cs-next-up relative flex items-center overflow-hidden text-left"
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- next-up art
        <img
          src={image}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 z-[1] bg-black/75" aria-hidden />
      <div className="relative z-[2] mx-auto w-full max-w-[1140px] px-6 sm:px-10 xl:px-[3.5vw]">
        <Link
          href={`/work/${next.slug}`}
          onClick={go}
          data-cursor="hover"
          className="group relative inline-block max-w-full font-serif text-[34px] font-thin leading-[1.3] text-white/50 no-underline transition-[padding] duration-[400ms] ease-in-out hover:pl-[2.5vw] xl:text-[5vw]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-[0.55em] left-[2.5vw] z-[-1] size-[1.8vw] min-h-[18px] min-w-[18px] rounded-full opacity-0 transition-all duration-[400ms] ease-in-out group-hover:left-0 group-hover:opacity-100"
            style={{ backgroundColor: RED }}
          />
          <span ref={textRef} className="relative">
            {label}
          </span>
        </Link>
      </div>
    </section>
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

/** Design-Interventions mockup showcase (Figma 1099:14538): a dark forest-teal
 *  band with the intro copy top-left and the framed website mockups arranged as
 *  an offset two-column masonry, each sitting on a pale sage panel. */
function MockupMasonry({
  heading,
  body,
  images,
}: {
  heading?: string;
  body?: string;
  images: string[];
}) {
  // Two equal columns (left: 1st/3rd/5th, right: 2nd/4th), tops aligned —
  // same as the live site's Supporting Design Streams grid.
  const left = images.filter((_, i) => i % 2 === 0);
  const right = images.filter((_, i) => i % 2 === 1);

  const Panel = ({ src }: { src: string }) => (
    <div
      className="rounded-[8px] p-[7%]"
      style={{ backgroundColor: SAGE_PANEL }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="block h-auto w-full drop-shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
      />
    </div>
  );

  return (
    <section
      className="px-6 py-[60px] sm:px-10 xl:px-[3.5vw] xl:py-[5vw]"
      style={{ backgroundColor: FOREST }}
    >
      {(heading || body) && (
        <div className="mb-10 max-w-[560px] xl:mb-[3vw]">
          {heading && <Label light>{heading}</Label>}
          {body && (
            <p className="text-[13px] leading-[1.55] text-white/90 xl:text-[0.95vw]">
              {body}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6 xl:gap-[2vw]">
        <div className="flex flex-1 flex-col gap-6 xl:gap-[2vw]">
          {left.map((src, i) => (
            <Panel key={i} src={src} />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-6 xl:gap-[2vw]">
          {right.map((src, i) => (
            <Panel key={i} src={src} />
          ))}
        </div>
      </div>
    </section>
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
              className="shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)]"
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
