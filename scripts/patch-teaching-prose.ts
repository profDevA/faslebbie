/**
 * Patch only the Teaching `.philosophy` prose on the teachingPage singleton.
 * Copy: Final Edits_faslebbiesite (2).docx — Teaching `.philosophy` (teachingIntro in teaching-seed.ts).
 *
 * Deliberately a patch, not a re-seed: migrate-pages.ts `seedTeaching()` does a
 * createOrReplace and rebuilds `students` / `exhibitionTiles` from
 * public/teaching/, which is not in the working tree. Running it here would
 * drop every student slide and exhibition photo already in Sanity.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-teaching-prose.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  teachingIntro,
  teachingSections,
  type TeachToken,
} from "./seed/teaching-seed";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type MarkDef = Record<string, unknown> & { _key: string; _type: string };

interface SpanBuild {
  text: string;
  markDef?: Omit<MarkDef, "_key">;
}

function block(spans: SpanBuild[]) {
  const markDefs: MarkDef[] = [];
  const children = spans.map((s) => {
    const marks: string[] = [];
    if (s.markDef) {
      const _key = key();
      markDefs.push({ _key, ...s.markDef } as MarkDef);
      marks.push(_key);
    }
    return { _type: "span", _key: key(), text: s.text, marks };
  });
  return { _type: "block", _key: key(), style: "normal", markDefs, children };
}

function teachSpan(tok: TeachToken): SpanBuild {
  if (tok.t === "pill")
    return {
      text: tok.text,
      markDef: tok.expansion
        ? { _type: "expandPill", expansion: tok.expansion }
        : { _type: "pill" },
    };
  if (tok.t === "term") return { text: tok.text, markDef: { _type: "term" } };
  if (tok.t === "student")
    return { text: tok.text, markDef: { _type: "ref", targetId: tok.id } };
  if (tok.t === "action")
    return {
      text: tok.text,
      markDef: {
        _type: "action",
        kind: tok.kind === "exhibition" ? "explore-exhibition" : "see-students",
      },
    };
  return { text: tok.text };
}

const teachBlocks = (paras: TeachToken[][]) =>
  paras.map((p) => block(p.map(teachSpan)));

async function run() {
  const before = await client.fetch<{
    students?: unknown[];
    exhibitionTiles?: unknown[];
  } | null>(
    `*[_id == "teachingPage"][0]{ students, exhibitionTiles }`,
  );

  if (!before) {
    console.error("teachingPage not found — run migrate-pages.ts first.");
    process.exit(1);
  }

  console.log(
    `Before: ${before.students?.length ?? 0} students, ${before.exhibitionTiles?.length ?? 0} exhibition tiles (left untouched)`,
  );

  await client
    .patch("teachingPage")
    .set({
      intro: teachBlocks(teachingIntro),
      sections: teachingSections.map((s) => ({
        _type: "teachingSection",
        _key: key(),
        kicker: s.kicker,
        body: teachBlocks(s.paragraphs),
        actionKind: s.action.kind,
        actionText: s.action.text,
      })),
    })
    .commit();

  const after = await client.fetch<{
    students?: unknown[];
    exhibitionTiles?: unknown[];
  }>(`*[_id == "teachingPage"][0]{ students, exhibitionTiles }`);

  console.log(
    `✓ teachingPage prose patched — ${teachingIntro.length} intro paragraph(s), ${teachingSections.length} section(s)`,
  );
  console.log(
    `After:  ${after.students?.length ?? 0} students, ${after.exhibitionTiles?.length ?? 0} exhibition tiles`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
