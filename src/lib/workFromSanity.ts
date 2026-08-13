import type { PortableTextBlock } from "@portabletext/types";

import type { WorkToken } from "@/lib/content";
import { proseParagraphs, type ProseRun } from "@/lib/sanityProse";
import { STACK_ICONS_PER_ROW } from "@/lib/portraitLayout";
import type { ToolStackItem, WorkPageConfig } from "@/sanity/types";

export interface WorkToolStackLogo {
  src: string;
  label: string;
  width: number;
  height: number;
}

export interface WorkContentData {
  narrative: WorkToken[][];
  sectionTitle?: string;
  loadMoreLabel?: string;
  enableTextView: boolean;
  enableImageView: boolean;
  toolStack: WorkToolStackLogo[];
  toolStackPerRow: number;
  appearance?: WorkPageConfig["appearance"];
}

function clampPerRow(n: number | undefined): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return STACK_ICONS_PER_ROW;
  return Math.max(1, Math.min(12, Math.round(n)));
}

function mapToolStack(
  items: ToolStackItem[] | undefined,
): WorkToolStackLogo[] {
  if (!items?.length) return [];
  return items
    .filter((i) => i.label?.trim() && i.src?.trim())
    .map((i) => ({
      label: i.label!.trim(),
      src: i.src!.trim(),
      width: i.width && i.width > 0 ? i.width : 32,
      height: i.height && i.height > 0 ? i.height : 32,
    }));
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
    toolStack: mapToolStack(data?.toolStack),
    toolStackPerRow: clampPerRow(data?.toolStackPerRow),
    appearance: data?.appearance,
  };
}
