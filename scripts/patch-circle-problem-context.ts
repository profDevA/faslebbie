/**
 * Circle §03 Problem Context / What I Brought
 * (Figma desktop `4171:32293` / mobile `4171:37248`).
 *
 * Visible headings are Problem Context + What I Brought. Layer names still say
 * "Emotional Browsing" — that is the reused text style, not the heading.
 * Desktop body is Coral lorem. Mobile frame still has leftover Coral Health
 * healthcare copy — ignore it.
 *
 * No live-site Circle copy yet. Provisional Figma lorem until the collab export.
 * Does not touch hero, overview, or the shared section-height rule.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-problem-context.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-problem-context.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-problem-context.ts --with-user-token -- --appearance-only
 *   npx sanity exec scripts/patch-circle-problem-context.ts --with-user-token -- --copy-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const COPY_ONLY = process.argv.includes("--copy-only");
const SLUG = "circle";

const BAND_BG = "#171717";
const TEXT = "#ffffff";

const copy = collab[SLUG as keyof typeof collab] as {
  problemContext: { problem: string; brought: string };
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
  const patch = client.patch(docId);
  if (!COPY_ONLY) {
    patch.set({ [`sections[${idx}].appearance`]: appearance });
  }
  if (!APPEARANCE_ONLY) {
    patch.set({
      [`sections[${idx}].problemHeading`]: "Problem Context",
      [`sections[${idx}].broughtHeading`]: "What I Brought",
      [`sections[${idx}].problemBody`]: pt(copy.problemContext.problem),
      [`sections[${idx}].broughtBody`]: pt(copy.problemContext.brought),
    });
  }
  if (!DRY) await patch.commit();
}

async function main() {
  console.log(
    `patch-circle-problem-context (${DRY ? "dry" : "live"}${APPEARANCE_ONLY ? ", appearance-only" : ""}${COPY_ONLY ? ", copy-only" : ""})`,
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
  console.log(`  problem chars: ${copy.problemContext.problem.length}`);
  console.log(`  brought chars: ${copy.problemContext.brought.length}`);

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

  console.log("✓ Circle Problem Context patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
