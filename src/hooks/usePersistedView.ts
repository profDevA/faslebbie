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
  aliases?: Record<string, T>,
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const resolve = (v: string | null): T | null => {
    if (!v) return null;
    if (views.includes(v as T)) return v as T;
    return aliases?.[v] ?? null;
  };

  const viewParam = searchParams.get("view");
  const fromUrl = resolve(viewParam);
  const [view, setViewState] = useState<T>(fromUrl ?? fallback);

  // URL → state only. Do not depend on local `view` or unstable `views` refs.
  useEffect(() => {
    setViewState(resolve(viewParam) ?? fallback);
    // views/aliases are fixed per page mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam, fallback]);

  const setView = (next: T) => {
    const current = resolve(viewParam) ?? view;
    if (next === current) return;
    setViewState(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [view, setView];
}
