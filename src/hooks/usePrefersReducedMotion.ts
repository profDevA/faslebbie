import { useState } from 'react'

/** Matches prior carousel logic — read once on mount (client-only components). */
export function usePrefersReducedMotion() {
  const [reduceMotion] = useState(() =>
    typeof window !== 'undefined'
      ? (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
        false)
      : false,
  )

  return reduceMotion
}
