"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A popup with its own address (Fas, Nov 16 evening: "there's no URL for them
 * so no one can find them… I can't send them a URL"). Opening a popup puts
 * `${basePath}/${id}` in the address bar, paging inside it replaces that
 * entry, closing goes back to `basePath`, and the browser Back button closes
 * it. The same address opened directly renders the page with the popup open
 * (each popup has a real route — e.g. app/research/[section]/page.tsx).
 *
 * Uses the native History API, which the App Router keeps in sync
 * (next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md).
 */
export function usePopupRoute<T extends string>(
  basePath: string,
  ids: readonly T[],
  initial: T | null = null,
  /** Where closing goes (default `basePath` + the current query). */
  closeHref?: string,
): {
  openId: T | null;
  open: (id: T) => void;
  navigate: (id: T) => void;
  close: () => void;
} {
  const [openId, setOpenId] = useState<T | null>(initial);

  const idFromPath = useCallback(
    (pathname: string): T | null => {
      if (!pathname.startsWith(`${basePath}/`)) return null;
      let seg = pathname.slice(basePath.length + 1).replace(/\/$/, "");
      try {
        seg = decodeURIComponent(seg);
      } catch {
        /* keep raw */
      }
      return ids.includes(seg as T) ? (seg as T) : null;
    },
    [basePath, ids],
  );

  useEffect(() => {
    const onPop = () => setOpenId(idFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [idFromPath]);

  const pathFor = (id: T) => `${basePath}/${encodeURIComponent(id)}`;

  const open = (id: T) => {
    setOpenId(id);
    const p = pathFor(id);
    if (window.location.pathname !== p) window.history.pushState(null, "", p);
  };
  const navigate = (id: T) => {
    setOpenId(id);
    window.history.replaceState(null, "", pathFor(id));
  };
  const close = () => {
    setOpenId(null);
    const to = closeHref ?? `${basePath}${window.location.search}`;
    if (`${window.location.pathname}${window.location.search}` !== to) {
      window.history.replaceState(null, "", to);
    }
  };

  return { openId, open, navigate, close };
}
