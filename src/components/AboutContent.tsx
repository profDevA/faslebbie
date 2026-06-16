"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AboutToken } from "@/lib/content";
import {
  aboutLogos,
  aboutPanels,
  aboutParagraphs,
  testimonials,
} from "@/lib/content";

// "What people are saying" — a pop-up you click "next" through (Fas 06/15).
function TestimonialsModal({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const go = (d: number) =>
    setI((c) => (c + d + testimonials.length) % testimonials.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((c) => (c + 1) % testimonials.length);
      if (e.key === "ArrowLeft")
        setI((c) => (c - 1 + testimonials.length) % testimonials.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[620px] bg-panel px-10 py-12 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-4 top-3 font-serif text-[24px] leading-none text-black/60 hover:text-black"
        >
          ×
        </button>
        <p className="font-serif text-[22px] font-medium leading-[1.4] md:text-[26px] lg:text-[30px]">
          “{t.quote}”
        </p>
        <p className="mt-6 font-serif text-[15px] font-medium">{t.name}</p>
        <p className="font-serif text-[14px] text-black/55">{t.role}</p>
        <div className="mt-8 flex items-center justify-between">
          <span className="font-serif text-[13px] tabular-nums text-black/40">
            {i + 1} / {testimonials.length}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              data-cursor="hover"
              className="rounded-full border border-hairline bg-close px-4 py-1 font-serif text-[15px] font-medium"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              data-cursor="hover"
              className="rounded-full border border-hairline bg-close px-4 py-1 font-serif text-[15px] font-medium"
            >
              Next →
            </button>
          </div>
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-wider text-black/35">
          placeholder testimonials — final quotes pending
        </p>
      </div>
    </div>
  );
}

// Inline brand logo chip — colored rounded box with the logo. On hover it pops
// up ~4x and the logo wobbles (Emily-Campbell-style image pop-up).
function LogoChip({ name }: { name: keyof typeof aboutLogos }) {
  const logo = aboutLogos[name];
  return (
    <span
      data-cursor="hover"
      className="group relative mx-1 inline-flex h-[1.1em] w-[1.25em] items-center justify-center overflow-hidden rounded-[5px] align-middle transition-transform duration-200 ease-out will-change-transform hover:z-30 hover:scale-[4]"
      style={{ backgroundColor: logo.bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
      <img
        src={logo.src}
        alt={name}
        className="max-h-[70%] max-w-[78%] object-contain group-hover:animate-[logo-wobble_0.5s_ease-in-out_infinite]"
      />
    </span>
  );
}

// Inline personal photo — small rounded thumbnail that pops up on hover.
function PhotoChip({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      data-cursor="hover"
      className="group relative mx-1 inline-block h-[1.4em] w-[1.55em] overflow-hidden rounded-[6px] align-middle shadow-[0_1px_9px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out will-change-transform hover:z-30 hover:scale-[5]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static photo */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover group-hover:animate-[logo-wobble_0.6s_ease-in-out_infinite]"
      />
    </span>
  );
}

// System 1: a black >/~ tag that retype-cycles through its own word list on
// click (typewriter). Used twice in the first sentence — once for the role
// (designer/researcher/educator), once for the credential (the three degrees).
// The two tags cycle independently.
function TypingTag({ words }: { words: readonly string[] }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(words[0]);
  // Mirror the live text in a ref so the effect can read it without scheduling
  // side effects inside a state updater (which StrictMode double-invokes).
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    const target = words[idx];
    const from = shownRef.current;
    if (from === target) return; // nothing to do (initial render / no change)
    let cancelled = false;
    const timers: number[] = [];
    let t = 0;
    // backspace `from` (quick), then type `target` at a slow, deliberate pace
    for (let i = from.length - 1; i >= 0; i--) {
      const n = i;
      timers.push(window.setTimeout(() => !cancelled && setShown(from.slice(0, n)), t));
      t += 45;
    }
    for (let i = 1; i <= target.length; i++) {
      const n = i;
      timers.push(window.setTimeout(() => !cancelled && setShown(target.slice(0, n)), t));
      t += 95;
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [idx, words]);

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => setIdx((i) => (i + 1) % words.length)}
      className="mx-1 inline-flex items-center bg-[#141414] px-2.5 py-0.5 text-left align-middle font-grotesk text-[0.8em] text-bg"
      aria-label={`${shown}. Click to cycle.`}
    >
      <span className="mr-1.5 text-accent">{">/~"}</span>
      {shown}
      <span className="ml-0.5 inline-block w-px animate-pulse self-stretch bg-bg" />
    </button>
  );
}

// Dropdown panel for an About keyword (Systems 2 & 3) — mirrors the homepage panel.
function AboutPanel({ keyword, onClose }: { keyword: string; onClose: () => void }) {
  const panel = aboutPanels[keyword];
  if (!panel) return null;
  return (
    <span className="mt-4 block animate-[panel-in_0.25s_ease-out] text-left text-[16px] leading-[1.4] tracking-[0.04em]">
      <span className="relative block w-full max-w-190 border-l-4 border-accent bg-panel px-[17px] py-[14px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-[12px] top-[10px] font-serif text-[20px] leading-none text-black/60 transition-colors hover:text-black"
        >
          ×
        </button>
        <span className="block pr-6 font-bold lowercase">{keyword}</span>
        {panel.body.map((b, i) => (
          <span key={i} className="mt-2 block font-medium">
            {b}
          </span>
        ))}
        {panel.placeholder && (
          <span className="mt-1 block text-[12px] uppercase tracking-wider text-black/40">
            placeholder — final copy pending
          </span>
        )}
        {panel.cta && (
          <Link
            href={panel.cta.href}
            data-cursor="hover"
            className="mt-2 inline-block font-medium text-accent underline underline-offset-2"
          >
            {panel.cta.label} →
          </Link>
        )}
      </span>
    </span>
  );
}

export default function AboutContent({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [testimonialsOpen, setTestimonialsOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const TESTIMONIAL_KEY = "what people are saying";

  // Click outside closes the open panel (keyword clicks toggle themselves).
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.("[data-about-key], [data-about-panel]")) return;
      setActive(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active]);

  return (
    <section
      ref={rootRef}
      id="about"
      className={`font-serif text-[22px] font-medium leading-[1.5] tracking-[0.02em] md:text-[28px] lg:text-[34px] ${className}`}
    >
      {aboutParagraphs.map((para, i) => {
        // The active keyword in this paragraph (if any). Red keywords open the
        // boxed panel below; gray (System-2) keywords expand inline (purple
        // continuation text) and never render the box.
        const activeKey = active
          ? para.find(
              (t): t is Extract<AboutToken, { t: "key" }> =>
                t.t === "key" && t.text === active,
            )
          : undefined;
        const showBox = Boolean(activeKey && activeKey.tone !== "gray");
        return (
          <p key={i} className="mb-7">
            {para.map((tok, j) => {
              if (tok.t === "text") return <span key={j}>{tok.text}</span>;
              if (tok.t === "typer") return <TypingTag key={j} words={tok.words} />;
              if (tok.t === "logo") return <LogoChip key={j} name={tok.name} />;
              if (tok.t === "photo")
                return <PhotoChip key={j} src={tok.src} alt={tok.alt} />;
              if (tok.t === "term") {
                return (
                  <span
                    key={j}
                    className="mx-1 inline-flex items-center bg-[#141414] px-2.5 py-0.5 align-middle font-grotesk text-[0.8em] text-bg"
                  >
                    <span className="mr-1.5 text-accent">{">/~"}</span>
                    {tok.text}
                  </span>
                );
              }
              // key — expands a panel on click. tone "gray" (System 2: Product,
              // Transition design, AI as material, Scalar Design Leadership) =
              // black text on a gray pill; default "red" = homepage style.
              const isActive = active === tok.text;
              const panel = aboutPanels[tok.text];
              const hasPanel = Boolean(panel);
              const isGray = tok.tone === "gray";
              return (
                <Fragment key={j}>
                  <button
                    type="button"
                    data-about-key
                    data-cursor="hover"
                    aria-expanded={isActive}
                    onClick={() => {
                      if (tok.text === TESTIMONIAL_KEY) {
                        setActive(null);
                        setTestimonialsOpen(true);
                      } else if (hasPanel) {
                        setActive((cur) => (cur === tok.text ? null : tok.text));
                      }
                    }}
                    className={`mx-[0.05em] rounded-full px-[0.25em] transition-colors ${
                      isGray ? "text-black" : "text-accent"
                    } ${isActive ? "bg-black/20" : "bg-pill hover:bg-black/15"}`}
                  >
                    {tok.text}
                  </button>
                  {/* Gray (System-2) keyword: explanation unveils inline as a
                      purple continuation of the sentence — no box (Figma 187:*,
                      color #8a38f5, Reckless Neue Regular). */}
                  {isGray && isActive && panel && (
                    <span
                      data-about-panel
                      className="font-normal text-[#8a38f5]"
                    >
                      {" "}
                      {panel.body.join(" ")}
                      {panel.cta && (
                        <>
                          {" "}
                          <Link
                            href={panel.cta.href}
                            data-cursor="hover"
                            className="underline underline-offset-2"
                          >
                            {panel.cta.label} →
                          </Link>
                        </>
                      )}
                    </span>
                  )}
                </Fragment>
              );
            })}
            {showBox && active && (
              <span data-about-panel>
                <AboutPanel keyword={active} onClose={() => setActive(null)} />
              </span>
            )}
          </p>
        );
      })}
      {testimonialsOpen && (
        <TestimonialsModal onClose={() => setTestimonialsOpen(false)} />
      )}
    </section>
  );
}
