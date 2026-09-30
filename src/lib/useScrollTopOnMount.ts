"use client";

import { useLayoutEffect } from "react";

/** Client-side route changes keep scrollY; long pages should open at the top (Fas Sep 30 QA). */
export function useScrollTopOnMount() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}
