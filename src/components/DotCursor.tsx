"use client";

import { useEffect, useRef } from "react";

// jsan.es-style dot cursor: a small dot trails the pointer and grows over
// interactive elements. mix-blend-difference keeps it visible on any surface.
export default function DotCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    document.documentElement.classList.add("has-dot-cursor");

    let x = -100;
    let y = -100;
    let targetX = x;
    let targetY = y;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const interactive = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor='hover']",
      );
      targetScale = interactive ? 2.8 : 1;
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    const loop = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      scale += (targetScale - scale) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-dot-cursor");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 size-3 rounded-full bg-white opacity-0 mix-blend-difference"
    />
  );
}
