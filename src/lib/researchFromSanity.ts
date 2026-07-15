import type { PortableTextBlock } from "@portabletext/types";

import type { SanityResearchPage } from "@/sanity/types";
import {
  researchAreas,
  researchClosing,
  researchSections,
  type ManifestoContent,
  type ManifestoRun,
  type ResearchArea,
  type ResearchSectionContent,
  type ResearchSectionId,
  type ResearchToken,
} from "@/lib/research";

export interface ResearchContentData {
  areas: ResearchArea[];
  closing: ResearchToken[];
  sections: Record<ResearchSectionId, ResearchSectionContent>;
}

const padN = (i: number) => String(i + 1).padStart(2, "0");

interface Span {
  _type?: string;
  text?: string;
  marks?: string[];
}
interface MarkDef {
  _key?: string;
  _type?: string;
  expansion?: string;
  section?: ResearchSectionId;
  href?: string;
}

// Flatten Portable Text blocks into the hero prose token stream. Each span's
// active annotation (found in the block's markDefs) decides the token kind.
function blocksToTokens(blocks?: PortableTextBlock[]): ResearchToken[] {
  if (!blocks?.length) return [];
  const tokens: ResearchToken[] = [];
  for (const block of blocks) {
    if (block._type !== "block") continue;
    const markDefs = (block.markDefs ?? []) as MarkDef[];
    const children = (block.children ?? []) as Span[];
    for (const span of children) {
      const text = span.text ?? "";
      if (!text) continue;
      const def = (span.marks ?? [])
        .map((k) => markDefs.find((d) => d._key === k))
        .find(Boolean);
      if (def?._type === "highlight") {
        tokens.push({ t: "hl", text, expansion: def.expansion });
      } else if (def?._type === "sectionLink" && def.section) {
        tokens.push({ t: "link", text, opens: def.section });
      } else if (def?._type === "link" && def.href) {
        tokens.push({ t: "ext", text, href: def.href });
      } else {
        tokens.push({ t: "text", text });
      }
    }
  }
  return tokens;
}

// Manifesto: one paragraph per block, bold runs flagged via the `strong` mark.
function blocksToManifesto(blocks?: PortableTextBlock[]): ManifestoRun[][] {
  if (!blocks?.length) return [];
  return blocks
    .filter((b) => b._type === "block")
    .map((block) =>
      ((block.children ?? []) as Span[])
        .filter((s) => s.text)
        .map<ManifestoRun>((s) => ({
          text: s.text ?? "",
          ...(s.marks?.includes("strong") ? { bold: true } : {}),
        })),
    )
    .filter((p) => p.length > 0);
}

// Merge Sanity content over the in-code defaults so a missing document (or a
// missing field) never blanks the page.
export function researchFromSanity(
  data: SanityResearchPage | null | undefined,
): ResearchContentData {
  const defaults: ResearchContentData = {
    areas: researchAreas,
    closing: researchClosing,
    sections: researchSections,
  };
  if (!data) return defaults;

  // The hero prose token structure — which word is a grey pill, which words are
  // red links that open which modal, and the click-to-reveal run nested inside
  // "African mining communities" (Figma 1-41001) — is presentation logic that
  // Sanity's plain-text highlight expansion can't represent, so it stays
  // code-driven. Sanity still owns the closing line and every modal section.
  const areas = defaults.areas;

  const closingTokens = blocksToTokens(data.closing);
  const closing = closingTokens.length ? closingTokens : defaults.closing;

  const sections = { ...defaults.sections };

  if (data.paradigms?.items?.length) {
    sections.paradigms = {
      kind: "paradigms",
      label: data.paradigms.label ?? "Paradigms",
      intro: data.paradigms.intro ?? "",
      items: data.paradigms.items.map((it, i) => ({
        n: padN(i),
        title: it.title ?? "",
        body: it.body ?? "",
      })),
    };
  }

  if (data.principles?.items?.length) {
    sections.principles = {
      kind: "principles",
      label: data.principles.label ?? "Principles",
      intro: data.principles.intro ?? "",
      items: data.principles.items.map((it, i) => ({
        n: padN(i),
        title: it.title ?? "",
        body: it.body ?? "",
      })),
      conclusion: {
        kicker: data.principles.conclusionKicker ?? "",
        body: data.principles.conclusionBody ?? "",
      },
    };
  }

  if (data.modalities?.items?.length) {
    sections.modalities = {
      kind: "modalities",
      kicker: data.modalities.kicker ?? "",
      statement: data.modalities.statement ?? "",
      items: data.modalities.items.map((label, i) => ({ n: padN(i), label })),
      groups: (data.modalities.groups ?? []).map((g) => ({
        title: g.title ?? "",
        items: g.items ?? [],
      })),
      footnote: data.modalities.footnote ?? "",
    };
  }

  const manifestoParas = blocksToManifesto(data.manifesto);
  if (manifestoParas.length) {
    sections.manifesto = {
      kind: "manifesto",
      paragraphs: manifestoParas,
    } satisfies ManifestoContent;
  }

  if (data.fieldNotes?.length) {
    sections["field-notes"] = {
      kind: "field-notes",
      notes: data.fieldNotes.map((note, i) => ({
        n: padN(i),
        place: note.place ?? "",
        quote: note.quote ?? "",
        methodology: note.methodology ?? "",
        themes: note.themes ?? "",
        insight: note.insight ?? "",
        image: note.image,
      })),
    };
  }

  return { areas, closing, sections };
}
