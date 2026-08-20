import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** Sanity CDN URLs without params render the original; add width for sharp 2x/3x display. */
export function hiResUrl(url: string | undefined, width = 2400): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cdn.sanity.io")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "max");
    parsed.searchParams.set("q", "90");
    return parsed.toString();
  } catch {
    return url;
  }
}
