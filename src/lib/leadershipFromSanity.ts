import type { SanityLeadershipPage } from "@/sanity/types";
import { proseRuns, type ProseRun } from "@/lib/sanityProse";
import {
  leadershipClosing,
  leadershipExpansions,
  leadershipGallery,
  leadershipIntro,
  leadershipLead,
  type AboutToken,
  type LeadershipGalleryItem,
} from "@/lib/content";

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

// Flatten one field into tokens + collect the grey-pill reveal copy.
function fieldToTokens(
  runs: ProseRun[],
  expansions: Record<string, string>,
): AboutToken[] {
  return runs.map((run) => {
    const m = run.mark;
    if (m?._type === "expandPill" || m?._type === "pill") {
      if (m._type === "expandPill" && m.expansion) expansions[run.text] = m.expansion;
      return { t: "key", text: run.text, tone: "gray" };
    }
    return { t: "text", text: run.text };
  });
}

export function leadershipFromSanity(
  data: SanityLeadershipPage | null | undefined,
): LeadershipContentData {
  const defaults: LeadershipContentData = {
    intro: leadershipIntro,
    lead: leadershipLead,
    closing: leadershipClosing,
    expansions: leadershipExpansions,
    moments: leadershipGallery,
    momentsHeading: "My leadership moments",
    exploreText: "Explore my leadership moments",
    contactText: "Get in touch",
  };
  if (!data) return defaults;

  const expansions: Record<string, string> = {};
  const introRuns = proseRuns(data.intro);
  const leadRuns = proseRuns(data.lead);
  const closingRuns = proseRuns(data.closing);

  const intro = introRuns.length ? fieldToTokens(introRuns, expansions) : defaults.intro;
  const lead = leadRuns.length ? fieldToTokens(leadRuns, expansions) : defaults.lead;
  const closing = closingRuns.length
    ? fieldToTokens(closingRuns, expansions)
    : defaults.closing;

  const moments: LeadershipGalleryItem[] = data.moments?.length
    ? data.moments.map((m, i) => ({
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
      }))
    : defaults.moments;

  return {
    intro,
    lead,
    closing,
    expansions: Object.keys(expansions).length ? expansions : defaults.expansions,
    moments,
    momentsHeading: data.momentsHeading ?? defaults.momentsHeading,
    exploreText: data.exploreText ?? defaults.exploreText,
    contactText: data.contactText ?? defaults.contactText,
  };
}
