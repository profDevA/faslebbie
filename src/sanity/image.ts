import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Full-bleed heroes / case study art — upper bound only. */
export const SANITY_IMAGE_MAX_W = 2400;

/** Logos, favicons, stack icons (natural width ≤ 128px). */
const SMALL_NATURAL_W = 128;
const SMALL_ASSET_MAX_W = 256;

/** Covers, thumbs, avatars (natural width ≤ 800px). */
const MEDIUM_NATURAL_W = 800;
const MEDIUM_ASSET_MAX_W = 1200;

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** GROQ fragment — fetch crop/hotspot + asset, not a flat URL. */
export const SANITY_IMAGE_PROJ = `{ crop, hotspot, asset->{ _id, url, metadata { dimensions } } }`;

function isSanityImageObject(value: unknown): value is SanityImageSource {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const asset = (value as { asset?: unknown }).asset;
  if (!asset || typeof asset !== "object") return false;
  const a = asset as { url?: unknown; _ref?: unknown };
  return typeof a.url === "string" || typeof a._ref === "string";
}

function assetNaturalWidth(source: SanityImageSource): number | undefined {
  if (!source || typeof source !== "object") return undefined;
  const w = (source as { asset?: { metadata?: { dimensions?: { width?: number } } } })
    .asset?.metadata?.dimensions?.width;
  return typeof w === "number" && w > 0 ? w : undefined;
}

/** Sanity CDN filenames embed `-{w}x{h}.ext` — fallback when only a URL string exists. */
export function parseNaturalWidthFromSanityUrl(url: string): number | undefined {
  const m = url.match(/-(\d+)x\d+\.(?:jpe?g|png|webp|gif|avif)/i);
  if (!m) return undefined;
  const w = Number(m[1]);
  return w > 0 ? w : undefined;
}

/**
 * Pick a CDN `w` from natural pixel width — never blanket 2400.
 * Small assets stay small; large assets downscale only (no upscale).
 */
export function targetSanityWidth(
  naturalWidth: number | undefined,
  maxWidth = SANITY_IMAGE_MAX_W,
): number {
  if (!naturalWidth) return maxWidth;
  if (naturalWidth <= SMALL_NATURAL_W) {
    return Math.min(SMALL_ASSET_MAX_W, Math.ceil(naturalWidth * 2));
  }
  if (naturalWidth <= MEDIUM_NATURAL_W) {
    return Math.min(MEDIUM_ASSET_MAX_W, naturalWidth);
  }
  return Math.min(maxWidth, naturalWidth);
}

function resolveWidth(source: SanityImageSource, maxWidth: number): number {
  return targetSanityWidth(assetNaturalWidth(source), maxWidth);
}

/**
 * Studio crop + hotspot applied; use instead of `asset->url` for content images.
 * Request width follows asset size — small logos stay ~100px, heroes up to 2400.
 */
export function sanityImageUrl(
  source: SanityImageSource | null | undefined,
  maxWidth = SANITY_IMAGE_MAX_W,
): string | undefined {
  if (!source || typeof source === "string") {
    if (!source || typeof source !== "string") return undefined;
    return hiResUrl(source, maxWidth);
  }
  try {
    const w = resolveWidth(source, maxWidth);
    return urlFor(source).width(w).auto("format").quality(90).url();
  } catch {
    return undefined;
  }
}

function walkSanityImages(value: unknown, maxWidth: number): unknown {
  if (isSanityImageObject(value)) {
    return sanityImageUrl(value, maxWidth) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => walkSanityImages(item, maxWidth));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = walkSanityImages(child, maxWidth);
    }
    return out;
  }
  return value;
}

/** Deep-resolve every Sanity image object in a fetch result to a CDN URL. */
export function resolveSanityImages<T>(data: T, maxWidth = SANITY_IMAGE_MAX_W): T {
  return walkSanityImages(data, maxWidth) as T;
}

/** Add width/quality params to a Sanity CDN URL string (already-resolved URLs are left as-is). */
export function hiResUrl(
  url: string | undefined,
  maxWidth = SANITY_IMAGE_MAX_W,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cdn.sanity.io")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("w")) return url;
    const w = targetSanityWidth(parseNaturalWidthFromSanityUrl(url), maxWidth);
    parsed.searchParams.set("w", String(w));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "max");
    parsed.searchParams.set("q", "90");
    return parsed.toString();
  } catch {
    return url;
  }
}
