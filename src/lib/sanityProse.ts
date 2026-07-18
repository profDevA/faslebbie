import type { PortableTextBlock } from "@portabletext/types";

// Shared Portable Text → runs flattener for the interactiveProse fields used by
// the Teaching / Build / Leadership pages. Each paragraph (block) becomes an
// array of runs; each run carries the resolved annotation mark (found in the
// block's markDefs) so the per-page mappers can turn it into their own token.

export interface ProseMark {
  _type: string;
  expansion?: string;
  targetId?: string;
  kind?: string;
  href?: string;
}

export interface ProseRun {
  text: string;
  mark?: ProseMark;
}

interface Span {
  _type?: string;
  text?: string;
  marks?: string[];
}

/** One run array per block/paragraph. Empty spans are dropped. */
export function proseParagraphs(blocks?: PortableTextBlock[]): ProseRun[][] {
  if (!blocks?.length) return [];
  const paras: ProseRun[][] = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const markDefs = (block.markDefs ?? []) as ProseMark[] & { _key?: string }[];
    const runs: ProseRun[] = [];
    for (const span of (block.children ?? []) as Span[]) {
      const text = span.text ?? "";
      if (!text) continue;
      const mark = (span.marks ?? [])
        .map((k) => (markDefs as (ProseMark & { _key?: string })[]).find((d) => d._key === k))
        .find(Boolean) as ProseMark | undefined;
      runs.push(mark ? { text, mark } : { text });
    }
    if (runs.length) paras.push(runs);
  }
  return paras;
}

/** Flatten every block into a single run array (single-paragraph fields). */
export function proseRuns(blocks?: PortableTextBlock[]): ProseRun[] {
  return proseParagraphs(blocks).flat();
}
