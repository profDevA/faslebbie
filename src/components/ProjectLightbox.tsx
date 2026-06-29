"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseStudyAccordionItem, WorkProject } from "@/lib/content";

/**
 * Case-study overlay (Figma 807:8804 / 807:11960 / 838:71331).
 *
 * A full-screen, scrollable case study opened over a faded work page (airy
 * light backdrop — NOT a dark popup). Section system, top → bottom:
 *   1. Black hero (brand logo + curved photo + caption)
 *   2. Overview band (white prose + meta / teal framed photo)
 *   3. "What I Brought" — sage panel, accordion
 *   4. "Problem Context" — black, centred prose
 *   5. "My Approach" — sage blurb + orange "Design Process" accordion card
 *   6. "Feature Set" — tan, intro + Mobile/iPad/Desktop tabs + screen gallery
 *   7. "Design Interventions" — periwinkle, Grid/Slide tabs + slide gallery
 *   8. "Empowering…" — maroon callout (portrait + headline)
 *   9. Stat band — sage tiles
 *  10. "Impact" — black, centred prose
 *  11. "Next up — {project}" — dark full-bleed CTA
 *
 * Galleries/photos use placeholder tiles until Fas supplies real assets; only
 * authored projects (Coral Health) render the full study — the rest degrade to
 * hero + tagline.
 */

const TEAL = "#3f5d5b";
const SAGE = "#dde4dc";
const ORANGE = "#f2935f";
const TAN = "#b5926f";
const MAROON = "#4e2330";
const PERIWINKLE = "#a7b2d9";
const INK = "#0c0c0c";

export default function CaseStudyOverlay({
  projects,
  index,
  onIndex,
  onClose,
}: {
  projects: WorkProject[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const max = projects.length - 1;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Jump back to the top whenever the project changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  if (typeof document === "undefined") return null;
  const p = projects[index];
  if (!p) return null;
  const cs = p.caseStudy;
  const next = projects[(index + 1) % projects.length];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      onClick={onClose}
      className="fixed inset-0 z-100 flex justify-center bg-black/25 px-2 py-3 backdrop-blur-md animate-[panel-in_0.2s_ease-out] sm:px-6 sm:py-6"
    >
      <div
        ref={scrollRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1080px] overflow-y-auto overflow-x-hidden overscroll-contain bg-white shadow-[0_24px_90px_rgba(0,0,0,0.4)]"
      >
        {/* Sticky close bar. */}
        <div className="sticky top-0 z-30 flex items-center justify-end bg-white/95 px-5 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="font-grotesk text-[30px] leading-none text-black/70 transition-colors hover:text-black"
          >
            ×
          </button>
        </div>

        {/* 1 — Black hero. */}
        <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            <div className="relative z-10 flex flex-col justify-between gap-12 px-7 py-9 lg:min-h-[440px] lg:px-12 lg:py-14">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-9 shrink-0 rounded-[8px] lg:size-11"
                  style={{ backgroundColor: p.accent }}
                />
                <span className="font-grotesk text-[28px] font-bold leading-none text-white lg:text-[40px]">
                  {p.name}
                </span>
              </div>
              <p className="font-grotesk text-[11px] uppercase tracking-[0.16em] text-white/55">
                {p.name} · {cs?.caption ?? p.tagline}
              </p>
            </div>

            <div className="relative min-h-[260px] lg:min-h-[440px]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: cs?.heroImage
                    ? `url(${cs.heroImage})`
                    : `radial-gradient(120% 120% at 70% 25%, ${p.accent} 0%, ${p.accent}cc 45%, ${p.accent}80 100%)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  clipPath: "ellipse(86% 132% at 80% 26%)",
                }}
              />
            </div>
          </div>
        </section>

        {cs ? (
          <>
            {/* 2 — Overview band. */}
            <section className="grid grid-cols-1 lg:grid-cols-2">
              <div className="px-7 py-10 lg:px-12 lg:py-14">
                <Eyebrow>Overview</Eyebrow>
                <p className="mt-5 font-serif text-[19px] leading-normal text-black lg:text-[22px]">
                  {cs.overview}
                </p>
                {cs.visitHref && (
                  <a
                    href={cs.visitHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="mt-7 inline-block font-grotesk text-[13px] font-medium uppercase tracking-[0.18em] text-black underline underline-offset-4 transition-colors hover:text-accent"
                  >
                    Visit Site
                  </a>
                )}

                <div className="mt-10">
                  <Eyebrow>Research &amp; Design</Eyebrow>
                  <p className="mt-3 max-w-[34ch] font-serif text-[14px] leading-relaxed text-black/80">
                    {cs.meta.disciplines}
                  </p>
                  <p className="mt-6 font-serif text-[14px] leading-relaxed text-black/80">
                    <span className="font-semibold text-black">Duration:</span>{" "}
                    {cs.meta.duration}
                  </p>
                  <p className="mt-1 max-w-[40ch] font-serif text-[14px] leading-relaxed text-black/80">
                    <span className="font-semibold text-black">Team:</span>{" "}
                    {cs.meta.team}
                  </p>
                  {cs.meta.confidentiality && (
                    <p className="mt-9 max-w-[46ch] font-serif text-[12px] italic leading-relaxed text-black/45">
                      Confidentiality: {cs.meta.confidentiality}
                    </p>
                  )}
                </div>
              </div>

              {/* Teal panel with a speech-bubble framed photo. */}
              <div
                className="relative flex items-center justify-center px-7 py-14 lg:px-12"
                style={{ backgroundColor: TEAL }}
              >
                <div className="relative w-full max-w-[360px]">
                  <div
                    className="aspect-4/5 w-full rounded-[26px]"
                    style={{
                      backgroundImage: cs.overviewImage
                        ? `url(${cs.overviewImage})`
                        : "linear-gradient(150deg, #efe9dd 0%, #e3dccb 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute -bottom-3 left-12 size-7 rotate-45 rounded-[4px] bg-[#efe9dd]"
                  />
                </div>
              </div>
            </section>

            {/* 3 — What I brought (sage accordion). */}
            {cs.brought && (
              <section
                className="px-7 py-14 text-center lg:px-12 lg:py-20"
                style={{ backgroundColor: SAGE }}
              >
                <Eyebrow center>What I Brought</Eyebrow>
                <div className="mx-auto mt-8 max-w-[640px] text-left">
                  <Accordion items={cs.brought.items} />
                </div>
              </section>
            )}

            {/* 4 — Problem context (black). */}
            {cs.problem && (
              <section
                className="px-7 py-16 text-center lg:px-12 lg:py-24"
                style={{ backgroundColor: INK }}
              >
                <Eyebrow center light>
                  Problem Context
                </Eyebrow>
                <div className="mx-auto mt-8 max-w-[820px] space-y-5">
                  {cs.problem.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="font-serif text-[17px] leading-relaxed text-white/85 lg:text-[20px]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* 5 — My approach + orange Design Process accordion. */}
            {cs.approach && (
              <section
                className="grid grid-cols-1 gap-10 px-7 py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-12 lg:py-20"
                style={{ backgroundColor: SAGE }}
              >
                <div className="lg:self-end">
                  <Eyebrow>My Approach</Eyebrow>
                  <p className="mt-4 max-w-[42ch] font-serif text-[14px] leading-relaxed text-black/75">
                    {cs.approach.blurb}
                  </p>
                </div>
                <div
                  className="rounded-[10px] px-6 py-8 lg:px-9 lg:py-10"
                  style={{ backgroundColor: ORANGE }}
                >
                  <Eyebrow>Design Process</Eyebrow>
                  <div className="mt-5">
                    <Accordion items={cs.approach.items} tone="dark" />
                  </div>
                </div>
              </section>
            )}

            {/* 6 — Feature set gallery (tan). */}
            {cs.interventions && (
              <GallerySection
                bg={TAN}
                eyebrow="Feature Set"
                intro={cs.interventions}
                tabs={["Mobile View", "iPad View", "Desktop View"]}
                accent={p.accent}
                kind="phone"
              />
            )}

            {/* 7 — Design interventions gallery (periwinkle). */}
            {cs.interventions && (
              <GallerySection
                bg={PERIWINKLE}
                eyebrow="Design Interventions"
                intro={cs.interventions}
                tabs={["Grid View", "Slide View"]}
                accent={p.accent}
                kind="slide"
              />
            )}

            {/* 8 — Empowering callout (maroon). */}
            {cs.advocate && (
              <section
                className="relative overflow-hidden px-7 py-14 lg:px-12 lg:py-20"
                style={{ backgroundColor: MAROON }}
              >
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
                  <div
                    className="aspect-4/3 w-full rounded-[26px]"
                    style={{
                      backgroundImage:
                        "linear-gradient(150deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)",
                    }}
                  />
                  <div>
                    <h3 className="font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-white/90">
                      {cs.advocate.heading}
                    </h3>
                    <p className="mt-5 max-w-[46ch] font-serif text-[16px] leading-relaxed text-white/70 lg:text-[18px]">
                      {cs.advocate.body}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 9 — Stat band (sage). */}
            {cs.stats && cs.stats.length > 0 && (
              <section
                className="px-7 py-16 lg:px-12 lg:py-24"
                style={{ backgroundColor: SAGE }}
              >
                <div className="mx-auto grid max-w-[920px] grid-cols-1 gap-12 sm:grid-cols-3">
                  {cs.stats.map((s, i) => (
                    <div key={i}>
                      <p className="font-serif text-[64px] leading-none text-black lg:text-[80px]">
                        {s.value}
                      </p>
                      <p className="mt-5 font-grotesk text-[16px] font-bold text-black">
                        {s.label}
                      </p>
                      {s.note && (
                        <p className="mt-2 font-serif text-[14px] leading-relaxed text-black/60">
                          {s.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 10 — Impact (black). */}
            {cs.impact && (
              <section
                className="px-7 py-16 text-center lg:px-12 lg:py-24"
                style={{ backgroundColor: INK }}
              >
                <Eyebrow center light>
                  Impact
                </Eyebrow>
                <p className="mx-auto mt-8 max-w-[760px] font-serif text-[17px] leading-relaxed text-white/85 lg:text-[20px]">
                  {cs.impact}
                </p>
              </section>
            )}
          </>
        ) : (
          // Graceful fallback for projects without authored copy.
          <section className="px-7 py-14 lg:px-12 lg:py-24">
            <Eyebrow>Overview</Eyebrow>
            <p className="mt-5 max-w-[760px] font-serif text-[20px] leading-normal text-black lg:text-[24px]">
              {p.tagline}.
            </p>
            <p className="mt-9 font-grotesk text-[13px] uppercase tracking-[0.2em] text-black/40">
              Full case study coming soon
            </p>
          </section>
        )}

        {/* 11 — "Next up" CTA. */}
        <button
          type="button"
          onClick={() => onIndex((index + 1) % projects.length)}
          data-cursor="hover"
          className="group relative block w-full overflow-hidden text-center"
          style={{
            backgroundImage: `radial-gradient(120% 90% at 60% 10%, ${next.accent}55 0%, #161514 55%, #0a0a0a 100%)`,
          }}
        >
          <div className="flex flex-col items-center gap-6 px-6 py-20 lg:py-28">
            <span className="font-serif text-[40px] leading-none text-white lg:text-[64px]">
              Next up — {next.name}
            </span>
            <span className="border border-white/40 px-8 py-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.2em] text-white transition-colors group-hover:bg-white group-hover:text-black">
              Explore
            </span>
          </div>
        </button>

        {/* Footer caption. */}
        <div className="flex items-center gap-2 px-7 py-5 lg:px-12">
          <span className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">
            {p.name}
          </span>
          <span className="text-black/30">·</span>
          <span className="font-serif text-[12px] text-black/50">
            {cs?.caption ?? p.tagline}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Eyebrow({
  children,
  center,
  light,
}: {
  children: React.ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <p
      className={`font-grotesk text-[12px] font-medium uppercase tracking-[0.22em] ${
        light ? "text-white/60" : "text-black/55"
      } ${center ? "text-center" : ""}`}
    >
      {children}
    </p>
  );
}

function Accordion({
  items,
  tone = "light",
}: {
  items: CaseStudyAccordionItem[];
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(0);
  const line = tone === "dark" ? "border-black/20" : "border-black/15";
  const mark = tone === "dark" ? "text-black/70" : "text-black/55";
  const body = tone === "dark" ? "text-black/80" : "text-black/85";
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`border-t ${line} last:border-b`}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              data-cursor="hover"
              className="flex w-full items-center justify-between gap-6 py-4 text-left"
            >
              <span className="font-serif text-[15px] text-black/85">
                {it.title}
              </span>
              <span className={`font-grotesk text-[22px] leading-none ${mark}`}>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && it.body && (
              <p
                className={`pb-6 font-serif text-[17px] leading-normal lg:text-[19px] ${body}`}
              >
                {it.body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Asset-placeholder gallery (Figma "Feature Set" / "Design Interventions").
 * Renders an intro, a view-tab strip, and a grid of rounded placeholder tiles
 * keyed to the project accent. Real screen art drops in here later.
 */
function GallerySection({
  bg,
  eyebrow,
  intro,
  tabs,
  accent,
  kind,
}: {
  bg: string;
  eyebrow: string;
  intro: string;
  tabs: string[];
  accent: string;
  kind: "phone" | "slide";
}) {
  const [active, setActive] = useState(0);
  const tileAspect = kind === "phone" ? "aspect-9/19" : "aspect-3/2";
  const cols =
    kind === "phone"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2";
  const count = kind === "phone" ? 8 : 4;
  const dark = bg === MAROON || bg === INK;
  return (
    <section className="px-7 py-14 lg:px-12 lg:py-20" style={{ backgroundColor: bg }}>
      <Eyebrow light={dark}>{eyebrow}</Eyebrow>
      <p
        className={`mt-4 max-w-[60ch] font-serif text-[14px] leading-relaxed ${
          dark ? "text-white/75" : "text-black/75"
        }`}
      >
        {intro}
      </p>

      <div className="mt-8 flex items-center justify-center gap-8">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(i)}
            data-cursor="hover"
            className={`font-grotesk text-[13px] uppercase tracking-[0.16em] underline-offset-4 transition-opacity ${
              dark ? "text-white" : "text-black"
            } ${active === i ? "underline" : "opacity-50 hover:opacity-100"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={`mt-10 grid gap-5 ${cols}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${tileAspect} w-full rounded-[14px] bg-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.12)]`}
          >
            <div
              className="h-1/2 w-full rounded-t-[14px]"
              style={{
                backgroundImage: `radial-gradient(120% 120% at 30% 20%, ${accent}cc 0%, ${accent}55 100%)`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
