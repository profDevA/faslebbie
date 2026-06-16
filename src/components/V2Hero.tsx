"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import HeroParagraph from "@/components/HeroParagraph";

/**
 * aidesign-os-style shell hero (Figma 224:747 → 224:802). On load, a giant
 * "Fas lebbie / Ph.D." wordmark dominates with the paragraph faint behind it.
 * On scroll the wordmark fades back and the interactive paragraph comes forward.
 * The name stays in place — it fades, it doesn't scroll away.
 *
 * Progress is driven by a plain scroll listener (more reliable than Framer's
 * useScroll across versions); Framer Motion stays available for the wiggle pass.
 */
export default function V2Hero() {
  const ref = useRef<HTMLElement>(null);
  const wiggleRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); // 0 = top, 1 = fully scrolled through

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      setP(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Subtle "wiggle" on the wordmark (port of aidesign-os WiggleEffect.mjs:
  // layered sine offsets). Applied to an inner wrapper so it composes cleanly
  // with the scroll-driven opacity/scale on the outer element.
  useEffect(() => {
    const el = wiggleRef.current;
    if (!el) return;
    let raf = 0;
    let f = 0;
    const amp = 7;
    const loop = () => {
      f += 1;
      const x = Math.sin(f * 0.02) * amp + Math.sin(f * 0.011 + 1) * amp * 0.45;
      const y = Math.cos(f * 0.017) * amp * 0.6;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nameOpacity = 1 - p * 0.88; // 1 → 0.12
  const nameScale = 1 - p * 0.04; // subtle recede
  const paraOpacity = Math.min(0.2 + p * 2, 1); // 0.2 → 1 (sharp by ~40%)

  return (
    <section ref={ref} className="relative h-[220vh] shrink-0">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        {/* Big name wordmark — in front at the top, recedes behind on scroll */}
        <div
          aria-hidden
          style={{
            opacity: nameOpacity,
            transform: `scale(${nameScale})`,
            zIndex: p < 0.5 ? 20 : 0,
          }}
          className="pointer-events-none absolute inset-0 flex select-none items-stretch justify-center font-grotesk font-medium leading-[0.82] tracking-[-0.03em] text-black"
        >
          <div
            ref={wiggleRef}
            className="flex flex-1 flex-col justify-center bg-linear-to-b from-black via-[#2a2a2a] to-[#8a8a82] bg-clip-text text-transparent"
          >
            <span className="text-[72px] sm:text-[120px] md:text-[180px] lg:text-[230px]">Fas lebbie</span>
            <span className="self-end pr-[6%] text-[72px] sm:text-[120px] md:text-[180px] lg:text-[230px]">
              Ph.D.
            </span>
          </div>
        </div>

        {/* Small faded portrait, tucked behind the text like the Figma */}
        <div className="pointer-events-none absolute left-1/2 top-[34%] z-[5] -translate-x-1/4 opacity-70">
          <Image
            src="/portrait.png"
            alt=""
            width={120}
            height={108}
            className="h-[108px] w-[120px] object-cover object-top"
          />
        </div>

        {/* Interactive paragraph foreground */}
        <div
          style={{ opacity: paraOpacity }}
          className="relative z-10 mx-auto w-full max-w-[1088px]"
        >
          <HeroParagraph className="text-center" storyHref="#about" />
        </div>
      </div>
    </section>
  );
}
