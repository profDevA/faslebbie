import { proseRuns } from "@/lib/sanityProse";
import type { SanityHomePage } from "@/sanity/types";

export type HomeHeroSegment =
  | { type: "text"; text: string }
  | { type: "keyword"; href: string; text: string }
  | { type: "story"; text: string; href?: string };

export interface HomeContentData {
  segments: HomeHeroSegment[];
  storyHref: string;
}

/** Sanity Home page only — no in-code seed fallback. */
export function homeFromSanity(
  data: SanityHomePage | null | undefined,
): HomeContentData {
  const storyHref = data?.storyHref?.trim() || "/about";
  if (!data?.hero?.length) {
    return { segments: [], storyHref };
  }

  const segments: HomeHeroSegment[] = [];
  for (const run of proseRuns(data.hero)) {
    const m = run.mark;
    if (m?._type === "keyword" && m.href) {
      segments.push({ type: "keyword", href: m.href, text: run.text });
    } else if (m?._type === "story") {
      segments.push({
        type: "story",
        text: run.text,
        href: m.href?.trim() || storyHref,
      });
    } else {
      segments.push({ type: "text", text: run.text });
    }
  }

  return { segments, storyHref };
}
