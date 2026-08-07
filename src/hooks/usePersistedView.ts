"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keep a ".txt / .img" (etc.) view toggle in the URL so a refresh stays on the
 * same view. Fas 08/06: on Work, switching to `.img` then refreshing dropped
 * back to `.txt`.
 */
export function usePersistedView<T extends string>(
  views: readonly T[],
  fallback: T,
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = searchParams.get("view");
  const initial = (
    fromUrl && views.includes(fromUrl as T) ? fromUrl : fallback
  ) as T;
  const [view, setViewState] = useState<T>(initial);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v && views.includes(v as T) && v !== view) setViewState(v as T);
  }, [searchParams, views, view]);

  const setView = (next: T) => {
    if (next === view) return;
    setViewState(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [view, setView];
}
