"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function readViewFromAddressBar(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("view");
}

function liveSearch(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Keep a ".txt / .img" (etc.) view toggle in the URL so a refresh stays on the
 * same view. Fas 08/06: on Work, switching to `.img` then refreshing dropped
 * back to `.txt`.
 *
 * Does not call useSearchParams — that bails the listing to client HTML with an
 * empty Suspense fallback, which looked like a failed load on slower AWS.
 * View is derived from window.location + the server-rendered ?view=.
 */
export function usePersistedView<T extends string>(
  views: readonly T[],
  fallback: T,
  aliases?: Record<string, T>,
  /** Server-rendered ?view= — hydration fallback when the address bar is not ready. */
  serverViewParam?: string | null,
): [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();

  const resolve = (v: string | null): T | null => {
    if (!v) return null;
    if (views.includes(v as T)) return v as T;
    return aliases?.[v] ?? null;
  };

  const [barParam, setBarParam] = useState<string | null>(
    () => readViewFromAddressBar() ?? serverViewParam ?? null,
  );

  useEffect(() => {
    const sync = () => setBarParam(readViewFromAddressBar());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [pathname]);

  const view = resolve(barParam) ?? fallback;

  const setView = (next: T) => {
    if (next === view) return;
    const params = liveSearch();
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setBarParam(next);
  };

  return [view, setView];
}
