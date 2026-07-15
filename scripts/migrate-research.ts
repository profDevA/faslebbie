/**
 * One-off migration: seed the `researchPage` singleton in Sanity from the
 * in-code data model (src/lib/research.ts) and upload the field-note image.
 * Idempotent: fixed _id + createOrReplace.
 *
 * Run from frontend/:
 *   sanity exec scripts/migrate-research.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
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
const PUBLIC = join(process.cwd(), "public");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

// ── hero prose (tokens → Portable Text with interactive marks) ──────────────
function proseBlock(tokens: ResearchToken[]) {
  const markDefs: Record<string, unknown>[] = [];
  const children = tokens.map((tok) => {
    const marks: string[] = [];
    if (tok.t === "hl") {
      const _key = key();
      const expansion = tok.expansion ?? researchExpansions[tok.text];
      markDefs.push({ _key, _type: "highlight", ...(expansion ? { expansion } : {}) });
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
    return { _type: "span", _key: key(), text: tok.text, marks };
  });
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs,
    children,
  };
}

const prose = (tokens: ResearchToken[]) => [proseBlock(tokens)];

// ── manifesto (runs → Portable Text, bold via `strong`) ─────────────────────
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

// ── field-note image upload ─────────────────────────────────────────────────
async function imageValue(p?: string) {
  if (!p) return undefined;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${p}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  const p = researchSections.paradigms as ParadigmsContent;
  const pr = researchSections.principles as PrinciplesContent;
  const m = researchSections.modalities as ModalitiesContent;

  const fieldNotes = [];
  const fieldNotesContent = researchSections["field-notes"] as FieldNotesContent;
  for (const note of fieldNotesContent.notes) {
    fieldNotes.push({
      _type: "researchFieldNote",
      _key: key(),
      place: note.place,
      quote: note.quote,
      methodology: note.methodology,
      themes: note.themes,
      insight: note.insight,
      image: await imageValue(note.image),
    });
  }

  const doc = {
    _id: "researchPage",
    _type: "researchPage",
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
  };

  await client.createOrReplace(doc);
  console.log("✓ seeded researchPage");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
