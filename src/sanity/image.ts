import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

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

/**
 * Studio crop + hotspot applied; use instead of `asset->url` for content images.
 * Small edge crops (e.g. trimming a black line) keep full width — only the
 * visible region is served at `width` px, not a downscaled file.
 */
export function sanityImageUrl(
  source: SanityImageSource | null | undefined,
  width = 2400,
): string | undefined {
  if (!source || typeof source === "string") return source || undefined;
  try {
    return urlFor(source).width(width).auto("format").quality(90).url();
  } catch {
    return undefined;
  }
}

function walkSanityImages(value: unknown, width: number): unknown {
  if (isSanityImageObject(value)) {
    return sanityImageUrl(value, width) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => walkSanityImages(item, width));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = walkSanityImages(child, width);
    }
    return out;
  }
  return value;
}

/** Deep-resolve every Sanity image object in a fetch result to a CDN URL. */
export function resolveSanityImages<T>(data: T, width = 2400): T {
  return walkSanityImages(data, width) as T;
}

/** Sanity CDN URLs without params render the original; add width for sharp 2x/3x display. */
export function hiResUrl(url: string | undefined, width = 2400): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cdn.sanity.io")) return url;
  try {
    const parsed = new URL(url);
    // Already built by sanityImageUrl (crop + width) — do not overwrite fit/rect.
    if (parsed.searchParams.has("w")) return url;
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "max");
    parsed.searchParams.set("q", "90");
    return parsed.toString();
  } catch {
    return url;
  }
}
