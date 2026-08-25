import type { SanityLeadershipPage } from "@/sanity/types";
import { proseRuns, type ProseRun } from "@/lib/sanityProse";
import type { AboutToken } from "@/lib/content";

export type LeadershipToken =
  | AboutToken
  | { t: "contact"; text: string };

export interface LeadershipSectionBlock {
  subheading?: string;
  tokens: LeadershipToken[];
}

export interface LeadershipSection {
  title: string;
  static: boolean;
  blocks: LeadershipSectionBlock[];
}

export interface LeadershipContentData {
  sections: LeadershipSection[];
  expansions: Record<string, string>;
  contactText: string;
}

function fieldToTokens(
  runs: ProseRun[],
  expansions: Record<string, string>,
): LeadershipToken[] {
  return runs.map((run) => {
    const m = run.mark;
    if (m?._type === "expandPill" || m?._type === "pill") {
      if (m._type === "expandPill" && m.expansion)
        expansions[run.text] = m.expansion;
      return { t: "key", text: run.text, tone: "gray" };
    }
    if (m?._type === "action" && m.kind === "contact")
      return { t: "contact", text: run.text };
    return { t: "text", text: run.text };
  });
}

const empty: LeadershipContentData = {
  sections: [],
  expansions: {},
  contactText: "",
};

/** Sanity Approach (/leadership) page only — no in-code seed fallback. */
export function leadershipFromSanity(
  data: SanityLeadershipPage | null | undefined,
): LeadershipContentData {
  if (!data) return empty;

  const expansions: Record<string, string> = {};

  const sections: LeadershipSection[] = (data.sections ?? [])
    .filter((s) => s.title && s.blocks?.length)
    .map((s) => ({
      title: s.title!.trim(),
      static: s.static ?? false,
      blocks: (s.blocks ?? [])
        .filter((b) => b.body?.length)
        .map((b) => ({
          subheading: b.subheading?.trim() || undefined,
          tokens: fieldToTokens(proseRuns(b.body), expansions),
        })),
    }));

  return {
    sections,
    expansions,
    contactText: data.contactText?.trim() || "",
  };
}
