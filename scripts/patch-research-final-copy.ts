/**
 * Patch researchPage copy from the collaboration doc Research tab.
 * Preserves SEO, field-note images, and Paradigms/Principles side images.
 * Do not run migrate-research.ts.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-research-final-copy.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  researchAreas,
  researchClosing,
  researchExpansions,
  researchSections,
  type FieldNotesContent,
  type ManifestoContent,
  type ModalitiesContent,
  type ParadigmsContent,
  type PrinciplesContent,
  type ResearchToken,
} from "../src/lib/research";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Child = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
  alt?: string;
  image?: unknown;
};

type Block = { children?: Child[]; [k: string]: unknown };

const ARTIFACTS_NEEDLE = "The work produced a set of artifacts:";

function insertArtifactsChip(blocks: Block[], image: unknown) {
  for (const block of blocks) {
    block.children = (block.children ?? []).filter((c) => c._type !== "aboutPhoto");
    const children = block.children;
    for (let i = 0; i < children.length; i++) {
      const text = children[i].text ?? "";
      const at = text.indexOf(ARTIFACTS_NEEDLE);
      if (at === -1) continue;
      const before = text.slice(0, at + ARTIFACTS_NEEDLE.length);
      const after = text.slice(at + ARTIFACTS_NEEDLE.length);
      children[i] = { ...children[i], text: before };
      const insert: Child[] = [
        {
          _type: "aboutPhoto",
          _key: key(),
          alt: "Mineral Choreography book cover",
          image,
        },
      ];
      if (after) insert.push({ ...children[i], _key: key(), text: after });
      children.splice(i + 1, 0, ...insert);
      return;
    }
  }
}

function splitParas(tokens: ResearchToken[]): ResearchToken[][] {
  const out: ResearchToken[][] = [[]];
  for (const tok of tokens) {
    if (tok.t === "break") {
      if (out[out.length - 1].length) out.push([]);
      continue;
    }
    out[out.length - 1].push(tok);
  }
  return out.filter((p) => p.length > 0);
}

function proseBlock(tokens: ResearchToken[], allowNested = true) {
  const markDefs: Record<string, unknown>[] = [];
  const children = tokens
    .filter((tok) => tok.t !== "break")
    .map((tok) => {
      const marks: string[] = [];
      if (tok.t === "hl") {
        const _key = key();
        const nested =
          allowNested && tok.expand?.length
            ? [proseBlock(tok.expand, false)]
            : undefined;
        const plain =
          !nested && (tok.expansion ?? researchExpansions[tok.text])
            ? [
                {
                  _type: "block",
                  _key: key(),
                  style: "normal",
                  markDefs: [],
                  children: [
                    {
                      _type: "span",
                      _key: key(),
                      text: tok.expansion ?? researchExpansions[tok.text],
                      marks: [],
                    },
                  ],
                },
              ]
            : undefined;
        markDefs.push({
          _key,
          _type: "highlight",
          ...(nested || plain ? { expansion: nested ?? plain } : {}),
        });
        marks.push(_key);
      } else if (tok.t === "link") {
        const _key = key();
        markDefs.push({ _key, _type: "sectionLink", section: tok.opens });
        marks.push(_key);
      } else if (tok.t === "ext") {
        const _key = key();
        markDefs.push({ _key, _type: "link", href: tok.href });
        marks.push(_key);
      }
      return {
        _type: "span",
        _key: key(),
        text:
          tok.t === "text" || tok.t === "hl" || tok.t === "link" || tok.t === "ext"
            ? tok.text
            : "",
        marks,
      };
    });
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs,
    children,
  };
}

const prose = (tokens: ResearchToken[]) =>
  splitParas(tokens).map((para) => proseBlock(para));

function manifestoBlocks() {
  const manifesto = researchSections.manifesto as ManifestoContent;
  return manifesto.paragraphs.map((runs) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: runs.map((run) => ({
      _type: "span",
      _key: key(),
      text: run.text,
      marks: run.bold ? ["strong"] : [],
    })),
  }));
}

async function main() {
  const existing = await client.fetch<{
    areas?: { body?: Block[] }[];
    fieldNotes?: Record<string, unknown>[];
    paradigmsImage?: unknown;
    principlesImage?: unknown;
  }>(`*[_id == "researchPage"][0]{
    areas,
    fieldNotes,
    "paradigmsImage": paradigms.image,
    "principlesImage": principles.image
  }`);

  let artifactsImage: unknown;
  for (const block of existing?.areas?.[0]?.body ?? []) {
    for (const child of block.children ?? []) {
      if (child._type === "aboutPhoto" && child.image) {
        artifactsImage = child.image;
        break;
      }
    }
    if (artifactsImage) break;
  }

  const p = researchSections.paradigms as ParadigmsContent;
  const pr = researchSections.principles as PrinciplesContent;
  const m = researchSections.modalities as ModalitiesContent;
  const fn = researchSections["field-notes"] as FieldNotesContent;
  const example = fn.notes[0];

  const fieldNotes = (existing?.fieldNotes ?? []).map((note, i) => {
    if (i !== 0 || !example) return note;
    return {
      ...note,
      place: example.place,
      quote: example.quote,
      themes: example.themes,
      insight: example.insight,
    };
  });

  await client.patch("researchPage").set({
    areas: researchAreas.map((a, i) => {
      const body = prose(a.body);
      if (i === 0 && artifactsImage) insertArtifactsChip(body, artifactsImage);
      return {
        _type: "researchArea",
        _key: key(),
        kicker: a.kicker,
        body,
      };
    }),
    closing: prose(researchClosing),
    paradigms: {
      _type: "researchParadigms",
      label: p.label,
      intro: p.intro,
      ...(existing?.paradigmsImage ? { image: existing.paradigmsImage } : {}),
      items: p.items.map((it) => ({
        _type: "researchNumberedItem",
        _key: key(),
        title: it.title,
        body: it.body,
      })),
    },
    principles: {
      _type: "researchPrinciples",
      label: pr.label,
      intro: pr.intro,
      ...(existing?.principlesImage ? { image: existing.principlesImage } : {}),
      items: pr.items.map((it) => ({
        _type: "researchNumberedItem",
        _key: key(),
        title: it.title,
        body: it.body,
      })),
      conclusionKicker: pr.conclusion.kicker,
      conclusionBody: pr.conclusion.body,
    },
    modalities: {
      _type: "researchModalities",
      kicker: m.kicker,
      statement: m.statement,
      items: m.items.map((it) => it.label),
      groups: m.groups.map((g) => ({
        _type: "researchModalityGroup",
        _key: key(),
        title: g.title,
        items: g.items,
      })),
      footnote: m.footnote,
    },
    manifesto: manifestoBlocks(),
    fieldNotes,
  }).commit();

  console.log(
    `before: ${existing?.areas?.length ?? 0} areas, ${existing?.fieldNotes?.length ?? 0} field notes`,
  );
  console.log(
    `✓ patched researchPage — ${researchAreas.length} areas, ${p.items.length} paradigms, ${pr.items.length} principles, ${fieldNotes.length} field notes (images kept, including section covers)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
