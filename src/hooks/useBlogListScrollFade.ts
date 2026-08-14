"use client";

import { useEffect } from "react";

/** Live faslebbie.com/blogs — item scale/opacity vs viewport center (reference JS). */
function metricsForDistance(
  factor: number,
  width: number,
): { scale: number; opacity: number } {
  if (width > 1024) {
    return {
      scale: 0.8 + (1 - factor) * 0.2,
      opacity: 0.7 + (1 - factor) * 0.3,
    };
  }
  if (width > 768) {
    return {
      scale: 0.85 + (1 - factor) * 0.15,
      opacity: 0.75 + (1 - factor) * 0.25,
    };
  }
  return {
    scale: 0.9 + (1 - factor) * 0.1,
    opacity: 0.8 + (1 - factor) * 0.2,
  };
}

/**
 * Scroll-driven fade + scale on `.blogs` list items — parity with live site
 * faslebbie.com/blogs (see docs/reference/faslebbie scroll-item animation).
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
        let { scale, opacity } = metricsForDistance(factor, winW);

        if (index === 0 && atTop) {
          scale = 1;
          opacity = 1;
        }

        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
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
        });
    };
  }, [active]);
}
