import type { SanityLeadershipPage } from "@/sanity/types";
import { proseRuns, type ProseRun } from "@/lib/sanityProse";
import type { AboutToken, LeadershipGalleryItem } from "@/lib/content";

export interface LeadershipContentData {
  intro: AboutToken[];
  lead: AboutToken[];
  closing: AboutToken[];
  expansions: Record<string, string>;
  moments: LeadershipGalleryItem[];
  momentsHeading: string;
  exploreText: string;
  contactText: string;
}

function fieldToTokens(
  runs: ProseRun[],
  expansions: Record<string, string>,
): AboutToken[] {
  return runs.map((run) => {
    const m = run.mark;
    if (m?._type === "expandPill" || m?._type === "pill") {
      if (m._type === "expandPill" && m.expansion)
        expansions[run.text] = m.expansion;
      return { t: "key", text: run.text, tone: "gray" };
    }
    return { t: "text", text: run.text };
  });
}

const empty: LeadershipContentData = {
  intro: [],
  lead: [],
  closing: [],
  expansions: {},
  moments: [],
  momentsHeading: "",
  exploreText: "",
  contactText: "",
};

/** Sanity Leadership page only — no in-code seed fallback. */
export function leadershipFromSanity(
  data: SanityLeadershipPage | null | undefined,
): LeadershipContentData {
  if (!data) return empty;

  const expansions: Record<string, string> = {};
  const intro = fieldToTokens(proseRuns(data.intro), expansions);
  const lead = fieldToTokens(proseRuns(data.lead), expansions);
  const closing = fieldToTokens(proseRuns(data.closing), expansions);

  const moments: LeadershipGalleryItem[] = (data.moments ?? []).map((m, i) => ({
    id: m.id ?? `m${i + 1}`,
    label: m.label ?? "",
    span: m.span ?? "md",
    highlight: m.highlight,
    popup: {
      image: m.image,
      name: m.name ?? "",
      role: m.role ?? "",
      testimonial: m.testimonial ?? "",
    },
  }));

  return {
    intro,
    lead,
    closing,
    expansions,
    moments,
    momentsHeading: data.momentsHeading ?? "",
    exploreText: data.exploreText ?? "",
    contactText: data.contactText ?? "",
  };
}
