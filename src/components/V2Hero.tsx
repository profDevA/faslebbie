"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import HeroParagraph from "@/components/HeroParagraph";
import { useSite } from "@/components/SiteProvider";
import type { HomeContentData } from "@/lib/homeFromSanity";
import { NAV_H_PX, NAV_TOP, LISTING_INSET_X, SITE_MAX_W } from "@/lib/navLayout";
import {
  HOME_PORTRAIT_HEIGHT,
  HOME_PORTRAIT_IMAGE_CLASS,
  HOME_PORTRAIT_WIDTH,
} from "@/lib/portraitLayout";
import {
  HOME_INTRO_REVEAL,
  START_BLUR,
  START_OPACITY,
  ramp,
  wordmarkOpacity,
} from "@/lib/reveal";

// Returning to Home from another page must NOT replay the intro (Fas 07/21).
const REVEAL_KEY = "home-revealed";

// False on every full document load; survives client-side navigation.
let documentPainted = false;

/**
 * Home — Figma 2218:75431 composition + original wordmark dissolve:
 * · Stretched "Fas lebbie" / "Ph.D." wordmark (no corner photo) fades back on scroll
 * · Centered portrait on top + centered bio come forward (brighten / de-blur)
 */


const NEAR_BLACK: [number, number, number] = [32, 32, 30];
const FADED_GREY: [number, number, number] = [183, 183, 175];
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const MOBILE_HERO_PORTRAIT_CLASS =
  "aspect-161/145 w-[132px] shrink-0 bg-[#f0f0f0] object-cover object-top";

export default function V2Hero({ content }: { content?: HomeContentData }) {
  const { brand } = useSite();
  const ref = useRef<HTMLElement>(null);
  const [introActive, setIntroActive] = useState(false);
  const [p, setP] = useState(1);
  const [fade, setFade] = useState(1);
  const fadeMax = useRef(1);

  useEffect(() => {
    documentPainted = true;
    if (!HOME_INTRO_REVEAL || window.innerWidth < 768) return;
    if (sessionStorage.getItem(REVEAL_KEY)) return;
    fadeMax.current = 0;
    setFade(0);
    setP(0);
    setIntroActive(true);
  }, []);

  const boxRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      if (window.innerWidth < 768) return;
      paraRef.current?.style.removeProperty("--hero-para-size");
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [content]);

  useEffect(() => {
    // Settled return-to-Home: same visual shell as post-intro, so pin scroll
    // at top (client nav can restore a mid-page offset and squash spacing).
    if (!introActive) {
      window.scrollTo(0, 0);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        total,
      );
      const pv = total > 0 ? scrolled / total : 0;
      setP(pv);
      const nextFade = Math.max(fadeMax.current, ramp(0.06, 1, pv));
      fadeMax.current = nextFade;
      setFade(nextFade);
      if (nextFade >= 0.99) sessionStorage.setItem(REVEAL_KEY, "1");
    };
    if (window.scrollY) window.scrollTo(0, 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [introActive]);

  const nameColor = mix(fade);
  const nameOpacity = wordmarkOpacity(fade);
  const nameZ = fade < 0.5 ? 30 : -10;

  // Portrait + bio both brighten as you scroll (wordmark recedes the other way).
  const portraitOpacity = START_OPACITY + fade * (1 - START_OPACITY);
  const contentOpacity = START_OPACITY + fade * (1 - START_OPACITY);
  const contentBlur = (1 - fade) * START_BLUR;
  const contentFront = fade >= 0.4;

  const heroHeight = introActive
    ? "h-[200vh]"
    : `h-[calc(100vh-${NAV_H_PX}px)]`;

  const storyHref = content?.storyHref ?? "/about";
  const segments = content?.segments ?? [];

  return (
    <>
      {/* Mobile (Fas Sep 28 QA): skip wordmark scroll; in-flow hero, document scroll only. */}
      <section className="relative shrink-0 px-6 pt-5 pb-10 md:hidden">
        <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-5">
          <Image
            src={brand.homePortraitSrc}
            alt="Portrait of Fas Lebbie"
            width={HOME_PORTRAIT_WIDTH}
            height={HOME_PORTRAIT_HEIGHT}
            priority
            className={MOBILE_HERO_PORTRAIT_CLASS}
          />
          <HeroParagraph
            className="home-hero-prose max-w-none text-left text-[22px] leading-[1.5] tracking-[1px]"
            storyHref={storyHref}
            segments={segments}
          />
        </div>
      </section>

      <section
        ref={ref}
        className={`relative hidden shrink-0 md:block ${heroHeight}`}
      >
      <div
        aria-hidden
        style={{
          color: nameColor,
          opacity: nameOpacity,
          zIndex: nameZ,
        }}
        className="pointer-events-none fixed inset-0 flex select-none flex-col justify-center overflow-hidden font-grotesk font-medium leading-[0.8] tracking-[-0.03em] will-change-[color,opacity]"
      >
        <div
          className={`mx-auto w-full ${SITE_MAX_W} ${LISTING_INSET_X} translate-y-[20vh]`}
        >
          <span className="block whitespace-nowrap text-[clamp(40px,13vw,250px)] lg:text-[216px]">
            {brand.logoName}
          </span>
          <span className="mt-[0.34em] block text-right text-[clamp(40px,13vw,250px)] lg:text-[216px]">
            {brand.logoSuffix}
          </span>
        </div>
      </div>

      {introActive && (
        <div
          aria-hidden
          className="pointer-events-none fixed right-6 top-6 z-30 font-grotesk text-[14px] tabular-nums tracking-[0.15em] text-black/40"
        >
          ({p < 0.5 ? 1 : 2})<span className="text-black/20"> / (2)</span>
        </div>
      )}

      {/* Same fixed shell for first visit AND return-to-Home — previously the
          settled path used in-flow h-full and looked tighter under the sticky nav.
          During the intro the shell must not be a scroll container: overflow-y-auto
          on a full-viewport overlay ate the touch pan on phones, so the wordmark
          never receded. Pointer events pass through except on the keyword links. */}
      <div
        ref={boxRef}
        className={`fixed inset-x-0 bottom-0 ${NAV_TOP} flex items-start justify-start px-6 pt-10 pb-12 md:pt-12 md:pb-14 lg:items-center lg:justify-center lg:px-[5vw] lg:py-0 ${
          introActive
            ? `pointer-events-none overflow-hidden${contentFront ? " [&_a]:pointer-events-auto" : ""}`
            : "overflow-y-auto"
        }`}
      >
        <div
          ref={paraRef}
          className="flex w-full max-w-275 flex-col items-center gap-10 lg:gap-8.25"
        >
          <Image
            src={brand.homePortraitSrc}
            alt="Portrait of Fas Lebbie"
            width={HOME_PORTRAIT_WIDTH}
            height={HOME_PORTRAIT_HEIGHT}
            priority
            style={{ opacity: portraitOpacity }}
            className={`${HOME_PORTRAIT_IMAGE_CLASS} will-change-[opacity]`}
          />
          <div
            style={{
              opacity: contentOpacity,
              filter: contentBlur ? `blur(${contentBlur}px)` : undefined,
              pointerEvents: contentFront ? undefined : "none",
            }}
            className="w-full will-change-[opacity,filter]"
          >
            <HeroParagraph
              className="max-w-272 text-left tracking-[1.65px] md:text-center"
              storyHref={storyHref}
              segments={segments}
            />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
