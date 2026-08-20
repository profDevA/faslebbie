/**
 * Patch researchPage copy from the collaboration doc Research tab.
 * Preserves SEO and field-note images. Do not run migrate-research.ts.
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
        text: tok.t === "text" || tok.t === "hl" || tok.t === "link" || tok.t === "ext"
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
    areas?: unknown[];
    fieldNotes?: Record<string, unknown>[];
  }>(`*[_id == "researchPage"][0]{ areas, fieldNotes }`);

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
    areas: researchAreas.map((a) => ({
      _type: "researchArea",
      _key: key(),
      kicker: a.kicker,
      body: prose(a.body),
    })),
    closing: prose(researchClosing),
    paradigms: {
      _type: "researchParadigms",
      label: p.label,
      intro: p.intro,
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
    `✓ patched researchPage — ${researchAreas.length} areas, ${p.items.length} paradigms, ${pr.items.length} principles, ${fieldNotes.length} field notes (images kept)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
