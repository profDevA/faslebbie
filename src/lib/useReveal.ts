"use client";

import { useEffect, useRef, useState } from "react";
import { pinPx, revealProgress } from "./reveal";

/**
 * Shared driver for the pinned scroll reveal (About / Work / Leadership).
 *
 * Israel 07/02: the reveal is a ONE-TIME entrance. Once the content has fully
 * come forward it must NOT replay when you scroll back up — the wordmark
 * shouldn't pop back to the front and the content shouldn't re-dim. "It just
 * stays the page. It's only when they get to the page the first time that it
 * shows this part." So we latch `r` at 1 the moment it first completes, and
 * only re-arm it when the reveal is re-activated (e.g. toggling back to the
 * `.txt` view, which scrolls to top).
 *
 * `active` = whether the pinned reveal should run at all (desktop + the right
 * view). When false (mobile, or a non-pinned view) `r` is forced to 1
 * (settled/clear) and `pin` to 0.
 */
export function useReveal(active: boolean = true) {
  const [r, setR] = useState(1);
  const [pin, setPin] = useState(0);
  // `r` RATCHETS: it can only increase, never decrease. Once the content has
  // come forward it stays forward on the way back up — the entrance plays ONCE
  // (Israel 07/04). Re-armed only when the reveal re-activates (e.g. toggling
  // back to the Work `.txt` view, which scrolls to top).
  const rMax = useRef(0);

  useEffect(() => {
    rMax.current = 0; // re-arm the entrance each time it (re)activates.

    const onScroll = () => {
      const mobile = window.innerWidth < 1024;
      if (mobile || !active) {
        setR(1);
        setPin(0);
        return;
      }
      setPin(pinPx(window.innerHeight));
      const next = Math.max(
        rMax.current,
        revealProgress(window.scrollY, window.innerHeight),
      );
      rMax.current = next;
      setR(next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active]);

  return { r, pin };
}
