// Sanity connection constants, read from env (see frontend/.env.local).
// projectId/dataset are public identifiers (safe in NEXT_PUBLIC_*), so they
// fall back to this project's known values — that way a missing env var on a
// build host (e.g. Vercel) can't crash config collection. The read token is
// server-only, never exposed to the browser, and required at runtime to read
// the PRIVATE dataset (set SANITY_API_READ_TOKEN in the host's env vars).

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "04q1381d";

/** Server-only token for reading the private dataset. Optional at build time. */
export const readToken = process.env.SANITY_API_READ_TOKEN || "";
