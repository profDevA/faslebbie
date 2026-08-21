"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function readViewFromAddressBar(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("view");
}

/**
 * Keep a ".txt / .img" (etc.) view toggle in the URL so a refresh stays on the
 * same view. Fas 08/06: on Work, switching to `.img` then refreshing dropped
 * back to `.txt`.
 *
 * View is derived from ?view= only — no parallel React state. When Next's
 * useSearchParams lags behind the address bar after router.replace, we read
 * window.location so URL and UI cannot desync (see ?view=media showing .words).
 */
export function usePersistedView<T extends string>(
  views: readonly T[],
  fallback: T,
  aliases?: Record<string, T>,
  /** Server-rendered ?view= — hydration fallback when client params not ready. */
  serverViewParam?: string | null,
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const resolve = (v: string | null): T | null => {
    if (!v) return null;
    if (views.includes(v as T)) return v as T;
    return aliases?.[v] ?? null;
  };

  const nextParam = searchParams.get("view");
  const [barParam, setBarParam] = useState<string | null>(
    () => readViewFromAddressBar() ?? serverViewParam ?? null,
  );

  useEffect(() => {
    setBarParam(readViewFromAddressBar());
  }, [nextParam, pathname]);

  const viewParam = barParam ?? nextParam ?? serverViewParam ?? null;
  const view = resolve(viewParam) ?? fallback;

  const setView = (next: T) => {
    if (next === view) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setBarParam(next);
  };

  return [view, setView];
}
