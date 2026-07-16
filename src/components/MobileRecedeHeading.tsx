"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Mobile page heading that RECEDES on scroll: it sits sharp/near-black at the
 * top, then its colour fades toward the page grey as you scroll so it drops
 * behind the prose — the mobile echo of the desktop watermark (Fas 07/15:
 * "research/leadership goes to the back when you scroll… same for the mobile").
 * Desktop uses the big fixed watermark instead, so this is mobile only.
 */

function ramp(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

const NEAR_BLACK: [number, number, number] = [23, 23, 23];
const FADED_GREY: [number, number, number] = [183, 183, 175];
function mix(t: number) {
  const c = NEAR_BLACK.map((a, i) => Math.round(a + (FADED_GREY[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export default function MobileRecedeHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // Ratchets so it never brightens back once it has receded.
  const [fade, setFade] = useState(0);
  const fadeMax = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const range = window.innerHeight * 0.6;
      const p = range > 0 ? Math.min(1, window.scrollY / range) : 0;
      const next = Math.max(fadeMax.current, ramp(0.05, 0.85, p));
      fadeMax.current = next;
      setFade(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <h1
      style={{ color: mix(fade), opacity: 1 - fade * 0.7 }}
      className={`will-change-[color,opacity] lg:hidden ${className}`}
    >
      {children}
    </h1>
  );
}
