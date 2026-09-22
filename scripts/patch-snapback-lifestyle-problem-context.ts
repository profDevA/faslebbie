/**
 * Snapback Lifestyle §03 Problem Context / What I Brought
 * (Figma desktop `4152:143794` — ignore Coral lorem in black band).
 *
 * Copy: live WP / case-studies.generated.ts — heading **Campaign Background**,
 * not generic "Problem Context". What I Brought = three WP accordion bodies.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-snapback-lifestyle-problem-context.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-snapback-lifestyle-problem-context.ts --with-user-token
 *   npx sanity exec scripts/patch-snapback-lifestyle-problem-context.ts --with-user-token -- --appearance-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "snapback-lifestyle";

const BAND_BG = "#171717";
const TEXT = "#ffffff";

const wp = generatedCaseStudies[SLUG] as {
  problem: string;
  problemHeading: string;
  brought: { title: string; paras: string[] }[];
};

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function pt(text: string) {
  return [
    {
      _type: "block" as const,
      _key: key(),
      style: "normal" as const,
      markDefs: [],
      children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
    },
  ];
}

function broughtBody() {
  const paras = wp.brought.flatMap((item) => item.paras);
  return paras.map((text) => ({
    _type: "block" as const,
    _key: key(),
    style: "normal" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
  }));
}

type Section = { _type: string; _key: string };

function idxOf(sections: Section[], type: string) {
  return sections.findIndex((s) => s._type === type);
}

async function patchDoc(docId: string, idx: number) {
  const doc = await client.getDocument(docId);
  if (!doc) return;
  const sections = (doc.sections ?? []) as {
    appearance?: Record<string, unknown>;
  }[];
  const appearance = {
    ...(sections[idx]?.appearance ?? {}),
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
    contentAlignment: "center",
  };
  const patch = client.patch(docId).set({
    [`sections[${idx}].appearance`]: appearance,
  });
  if (!APPEARANCE_ONLY) {
    patch.set({
      [`sections[${idx}].problemHeading`]: wp.problemHeading,
      [`sections[${idx}].broughtHeading`]: "What I Brought",
      [`sections[${idx}].problemBody`]: pt(wp.problem),
      [`sections[${idx}].broughtBody`]: broughtBody(),
    });
  }
  if (!DRY) await patch.commit();
}

async function main() {
  console.log(
    `patch-snapback-lifestyle-problem-context (${DRY ? "dry" : "live"}${APPEARANCE_ONLY ? ", appearance-only" : ""})`,
  );

  const pub = await client.fetch<{ _id: string; sections: Section[] }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, sections[]{ _type, _key }
    }`,
    { slug: SLUG },
  );
  if (!pub?.sections?.length) throw new Error(`Missing published ${SLUG}`);

  const idx = idxOf(pub.sections, "problemContextSection");
  if (idx < 0) throw new Error("No problemContextSection");
  console.log(`doc ${pub._id} problemContext[${idx}]`);

  console.log(`→ patch ${pub._id}`);
  await patchDoc(pub._id, idx);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ Snapback Lifestyle Problem Context patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
