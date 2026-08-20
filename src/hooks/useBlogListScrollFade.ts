"use client";

import { useEffect } from "react";

/** Live faslebbie.com/blogs `smoothScrollAnimation` — linear scale/opacity
 *  plus a light blur (max 1.5px). CSS 250ms ease-out on transform/opacity
 *  is what makes it feel like a flow rather than a snap. */
function metricsForDistance(
  factor: number,
  width: number,
): { scale: number; opacity: number; blur: number } {
  if (width > 1024) {
    return {
      scale: 0.8 + (1 - factor) * 0.2,
      opacity: 0.7 + (1 - factor) * 0.3,
      blur: factor * 1.5,
    };
  }
  if (width > 768) {
    return {
      scale: 0.85 + (1 - factor) * 0.15,
      opacity: 0.75 + (1 - factor) * 0.25,
      blur: factor * 1.5,
    };
  }
  return {
    scale: 0.9 + (1 - factor) * 0.1,
    opacity: 0.8 + (1 - factor) * 0.2,
    blur: factor * 1.5,
  };
}

/**
 * Scroll-driven fade + scale on `.blogs` list items — parity with live
 * faslebbie.com/blogs (inner-column `smoothScrollAnimation`).
 */
export function useBlogListScrollFade(active: boolean) {
  useEffect(() => {
    if (!active) return;

    let raf = 0;

    const tick = () => {
      const items = document.querySelectorAll<HTMLElement>(
        "[data-blog-scroll-item]",
      );
      if (!items.length) return;

      const winH = window.innerHeight;
      const center = winH / 2;
      const maxDistance = winH / 2;
      const winW = window.innerWidth;
      const atTop = window.scrollY === 0;

      items.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - itemCenter);
        const factor = Math.min(distance / maxDistance, 1);
        let { scale, opacity, blur } = metricsForDistance(factor, winW);

        if (index === 0 && atTop) {
          scale = 1;
          opacity = 1;
          blur = 0;
        }

        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `blur(${blur.toFixed(2)}px)`;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document
        .querySelectorAll<HTMLElement>("[data-blog-scroll-item]")
        .forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.filter = "";
        });
    };
  }, [active]);
}
