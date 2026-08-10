import type { PortableTextBlock } from "@portabletext/types";

import type { WorkToken } from "@/lib/content";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import type { WorkPageConfig } from "@/sanity/types";

export interface WorkContentData {
  narrative: WorkToken[][];
  sectionTitle?: string;
  loadMoreLabel?: string;
  enableTextView: boolean;
  enableImageView: boolean;
  appearance?: WorkPageConfig["appearance"];
}

function runToToken(run: ProseRun): WorkToken {
  const m = run.mark;
  if (m?._type === "project" && m.slug)
    return { t: "project", slug: m.slug, text: run.text };
  if (m?._type === "org") return { t: "org", text: run.text };
  return { t: "text", text: run.text };
}

export function workNarrativeFromBlocks(
  blocks?: PortableTextBlock[],
): WorkToken[][] {
  return proseParagraphs(blocks)
    .map((runs) => runs.map(runToToken))
    .filter((p) => p.length > 0);
}

/** Sanity Work page only — no in-code narrative fallback. */
export function workFromSanity(
  data: WorkPageConfig | null | undefined,
): WorkContentData {
  return {
    narrative: workNarrativeFromBlocks(data?.intro),
    sectionTitle: data?.sectionTitle,
    loadMoreLabel: data?.loadMoreLabel,
    enableTextView: data?.enableTextView !== false,
    enableImageView: data?.enableImageView !== false,
    appearance: data?.appearance,
  };
}
