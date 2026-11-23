"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PopupShell, { PopupDots, PopupPagerButton } from "@/components/PopupShell";
import type { Testimonial } from "@/lib/content";

/**
 * Mobile: grey profile (fixed block) + dark quote panel **fills to footer**
 * (no cream gap on short quotes). Long quotes scroll **inside** the dark panel.
 * Desktop: 2729:19758 two-column split.
 */
export default function TestimonialsModal({
  testimonials,
  onClose,
  section = "About",
}: {
  testimonials: Testimonial[];
  onClose: () => void;
  section?: string;
}) {
  const [i, setI] = useState(0);
  const quoteScrollRef = useRef<HTMLDivElement>(null);
  const max = testimonials.length - 1;
  const go = (d: number) => setI((c) => Math.min(max, Math.max(0, c + d)));

  useEffect(() => {
    quoteScrollRef.current?.scrollTo(0, 0);
  }, [i]);

  // Phones: a long quote ran under the pager mid-line with no sign there was
  // more (mobile QA M10, Nov 23). Fade the bottom while text is left below.
  // State, not the ref: the shell renders the panel only after it mounts.
  const [quoteEl, setQuoteEl] = useState<HTMLDivElement | null>(null);
  const [more, setMore] = useState(false);
  const quoteRef = useCallback((el: HTMLDivElement | null) => {
    quoteScrollRef.current = el;
    setQuoteEl(el);
  }, []);
  useEffect(() => {
    if (!quoteEl) return;
    const check = () =>
      setMore(quoteEl.scrollHeight - quoteEl.scrollTop - quoteEl.clientHeight > 4);
    const raf = requestAnimationFrame(check);
    quoteEl.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      quoteEl.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [quoteEl, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setI((c) => Math.max(0, c - 1));
      if (e.key === "ArrowRight") setI((c) => Math.min(max, c + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [max]);

  if (!testimonials.length) return null;
  const t = testimonials[i];
  const role = t.role.replace(/^[-–\s]+/, "");

  return (
    <PopupShell
      onClose={onClose}
      label="Testimonials"
      overlayProps={{ "data-about-panel": "" }}
      crumbs={[
        { label: section, href: "/about" },
        { label: "Testimonials" },
      ]}
      bodyClassName="reckless-prose flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:min-h-0 lg:grid-cols-2"
      footerClassName="reckless-prose"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between gap-4">
          <PopupPagerButton
            onClick={() => go(-1)}
            disabled={i === 0}
          >
            {"< Previous"}
          </PopupPagerButton>
          {/* Same dots as every popup instead of "1 / 16" (Fas, Nov 19 QA). */}
          <PopupDots
            className="flex min-w-0"
            count={testimonials.length}
            active={i}
            onSelect={setI}
            labelFor={(k) => testimonials[k].name}
          />

          <PopupPagerButton
            onClick={() => go(1)}
            disabled={i === max}
          >
            {"Next >"}
          </PopupPagerButton>
        </div>
      }
    >
      <div className="flex shrink-0 items-center justify-center bg-[#c2c2c2] px-4 py-8 max-lg:max-h-[min(40vh,320px)] lg:min-h-0 lg:flex-1 lg:max-h-none lg:py-10">
        <div className="flex w-full max-w-[330px] flex-col items-center gap-3 lg:gap-[18px]">
          {/* Desktop +2px on every line and a bigger photo (96 → 144; sources
              are 384 / 288 px) — Fas, Nov 19 QA. Mobile unchanged. */}
          <div className="size-[68px] shrink-0 overflow-hidden bg-white lg:size-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="size-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col items-center gap-2 text-center text-[#1e1e1e] lg:gap-3.5">
            <p className="text-[28px] font-normal leading-tight lg:text-[36px] lg:leading-[1.2]">
              {t.name}
            </p>
            <p className="text-[14px] font-normal text-black/70 lg:text-[22px]">
              {role}
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#1a1a1a] lg:min-h-0">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 transition-opacity duration-200 lg:hidden ${
            more ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "linear-gradient(to top, #1a1a1a 15%, rgba(26, 26, 26, 0))" }}
        />
        <div
          ref={quoteRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-8 [-webkit-overflow-scrolling:touch] lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-10"
        >
          <p className="w-full text-left text-[16px] font-normal leading-[1.6] text-[#e0e0d7] lg:mx-auto lg:max-w-[540px] lg:text-center lg:text-[18px] lg:leading-[1.6]">
            “{t.quote}”
          </p>
        </div>
      </div>
    </PopupShell>
  );
}
