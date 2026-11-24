"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { IntroCardData } from "@/lib/siteFromSanity";

/**
 * Floating intro-video card, bottom right (Fas, Nov 23 call: "build something
 * exactly like" the horizonx.so card). Content: Site Settings → Intro video
 * card. Mounted in the root layout, so it stays — and keeps playing — while
 * the visitor moves between pages.
 *
 * - Fades in INTRO_CARD_DELAY_MS after the page loads.
 * - Play → the video plays inside the card with sound (no navigation, unlike
 *   HorizonX); a click on the playing video pauses / resumes. No other
 *   controls. When it ends, the thumbnail comes back.
 * - ✕ stays on top; it hides the card for the rest of the browser session.
 * - z-35: under the mobile menu (z-40), the header and pager bar (z-50) and
 *   every popup / drawer / password modal (z-60+), so those simply cover it.
 * - Lifted above a page's bottom Previous / Next bar ([data-pager-bar]).
 */

/** How long after the page loads the card appears. */
const INTRO_CARD_DELAY_MS = 2500;
/** Set by ✕ — the card stays closed for the rest of the session (this tab). */
const CLOSED_KEY = "intro-card-closed";

function readClosed(): boolean {
  try {
    return sessionStorage.getItem(CLOSED_KEY) === "1";
  } catch {
    return false;
  }
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 14" className="ml-[2px] h-[11px] lg:h-[13px]">
      <path d="M0 0.8v12.4c0 .6.7 1 1.2.7l10.3-6.2c.5-.3.5-1.1 0-1.4L1.2.1C.7-.2 0 .2 0 .8Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 10 10" className="size-[9px] lg:size-[10px]" fill="none">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function IntroVideoCard({ card }: { card: IntroCardData | null }) {
  const pathname = usePathname();
  const onStudio = pathname?.startsWith("/studio") ?? false;
  const hasCard = card !== null;

  const [visible, setVisible] = useState(false);
  /** The video is showing in place of the thumbnail. */
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!hasCard || readClosed()) return;
    const t = window.setTimeout(() => setVisible(true), INTRO_CARD_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [hasCard]);

  // Sit above the page's bottom pager bar when it reaches the card's corner
  // (always on case studies; on phones also blog posts, where it's sticky).
  useEffect(() => {
    const el = rootRef.current;
    if (!visible || !el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const bar = document.querySelector<HTMLElement>("[data-pager-bar]");
      let lift = 0;
      if (bar) {
        const r = bar.getBoundingClientRect();
        const zoneTop = window.innerHeight - el.offsetHeight - 40;
        if (r.height > 0 && r.top < window.innerHeight && r.bottom > zoneTop) {
          lift = Math.max(0, window.innerHeight - r.top);
        }
      }
      el.style.setProperty("--intro-lift", `${Math.round(lift)}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    // A page that streams in after the route change.
    const late = window.setTimeout(measure, 800);
    // Capture: case studies scroll an inner panel on desktop, not the window.
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [visible, pathname]);

  if (!card || !visible || onStudio) return null;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    // Called inside the click, so the browser allows sound (iOS included).
    v.play().catch((err: unknown) => {
      if ((err as { name?: string })?.name !== "AbortError") setPlaying(false);
    });
    setPaused(false);
    setPlaying(true);
  };

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  };

  const close = () => {
    videoRef.current?.pause();
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {
      /* private mode: closes for this page view only */
    }
    setVisible(false);
  };

  const { kicker, text, button } = card;
  const external = button ? !button.href.startsWith("/") : false;
  const buttonClass =
    "flex w-full items-center justify-center rounded-full bg-white px-3 text-center font-medium leading-none text-black transition-opacity first:mt-0 hover:opacity-85 max-lg:mt-2.5 max-lg:h-[30px] max-lg:text-[12px] lg:mt-3 lg:h-9 lg:text-[13px]";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label="Intro video"
      data-cursor-invert
      style={{
        bottom:
          "max(var(--intro-gap) + env(safe-area-inset-bottom, 0px), var(--intro-lift, 0px) + var(--intro-gap))",
      }}
      className="fixed z-35 overflow-hidden bg-[#141614] font-grotesk text-white shadow-[0_10px_36px_rgba(0,0,0,0.28)] motion-safe:animate-[panel-in_0.4s_ease-out] max-lg:right-[calc(16px+env(safe-area-inset-right,0px))] max-lg:w-[200px] max-lg:rounded-xl max-lg:[--intro-gap:16px] lg:right-5 lg:w-[280px] lg:rounded-2xl lg:[--intro-gap:20px]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={card.videoSrc}
          preload="none"
          playsInline
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onEnded={() => {
            setPlaying(false);
            if (videoRef.current) videoRef.current.currentTime = 0;
          }}
          className={`absolute inset-0 size-full object-contain ${playing ? "" : "invisible"}`}
        />
        {playing ? (
          <button
            type="button"
            aria-label={paused ? "Play intro video" : "Pause intro video"}
            onClick={togglePause}
            data-cursor="hover"
            className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          />
        ) : (
          <button
            type="button"
            aria-label="Play intro video"
            onClick={play}
            data-cursor="hover"
            className="group absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            <Image
              src={card.thumbnailSrc}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, 200px"
              className="object-cover"
            />
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105 max-lg:size-[38px] lg:size-[47px]">
              <PlayIcon />
            </span>
          </button>
        )}
        {/* ✕ on top of the thumbnail and the playing video. 36 px hit area. */}
        <button
          type="button"
          aria-label="Close intro video"
          onClick={close}
          data-cursor="hover"
          className="group/close absolute right-0.5 top-0.5 z-10 flex size-9 items-center justify-center focus-visible:outline-none"
        >
          <span className="flex items-center justify-center rounded-full bg-black/55 text-white transition-colors group-hover/close:bg-black/75 group-focus-visible/close:outline-2 group-focus-visible/close:outline-white max-lg:size-[22px] lg:size-[25px]">
            <CloseIcon />
          </span>
        </button>
      </div>

      {kicker || text || button ? (
        <div className="max-lg:px-3 max-lg:pb-3 max-lg:pt-2.5 lg:px-4 lg:pb-3.5 lg:pt-3.5">
          {kicker ? (
            <p className="text-white/55 max-lg:text-[11px] max-lg:leading-[14px] lg:text-[13px] lg:leading-4">
              {kicker}
            </p>
          ) : null}
          {text ? (
            <p className="whitespace-pre-line font-semibold max-lg:mt-0.5 max-lg:text-[12.5px] max-lg:leading-4 lg:mt-1 lg:text-[15px] lg:leading-[19px]">
              {text}
            </p>
          ) : null}
          {button ? (
            external ? (
              <a
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className={buttonClass}
              >
                {button.label}
              </a>
            ) : (
              <Link href={button.href} data-cursor="hover" className={buttonClass}>
                {button.label}
              </Link>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
