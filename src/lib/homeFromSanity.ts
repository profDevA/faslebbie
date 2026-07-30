import {
  heroSegments,
  panels,
  type HeroSegment,
  type SectionId,
} from "@/lib/content";
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

/** Resolve in-code hero segments (SectionId keywords) to href-bearing segments. */
export function defaultHomeSegments(): HomeHeroSegment[] {
  return heroSegments.map((s: HeroSegment): HomeHeroSegment => {
    if (s.type === "keyword") {
      return {
        type: "keyword",
        href: panels[s.id as SectionId]?.cta.href ?? "/",
        text: s.text,
      };
    }
    if (s.type === "story") return { type: "story", text: s.text, href: "/about" };
    return { type: "text", text: s.text };
  });
}

export function homeFromSanity(
  data: SanityHomePage | null | undefined,
): HomeContentData {
  const storyHref = data?.storyHref?.trim() || "/about";
  if (!data?.hero?.length) {
    return { segments: defaultHomeSegments(), storyHref };
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

  return {
    segments: segments.length ? segments : defaultHomeSegments(),
    storyHref,
  };
}
