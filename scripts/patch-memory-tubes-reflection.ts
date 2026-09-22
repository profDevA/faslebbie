/**
 * Memory Tubes §11 Reflection + Next Steps — collab copy on existing reflectionSection.
 * Dark band #171717 (Coral template). Ignore Figma lorem.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-reflection.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-reflection.ts --with-user-token
 *   npx sanity exec scripts/patch-memory-tubes-reflection.ts --with-user-token -- --appearance-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { REFLECTION_APPEARANCE_DEFAULTS } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "memory-tubes";

const COPY = (
  collab[SLUG as keyof typeof collab] as {
    reflection?: { body?: string; nextSteps?: string[] };
  }
).reflection;

const BODY = COPY?.body?.trim();
const STEPS = COPY?.nextSteps ?? [];

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

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

function appearance() {
  return {
    _type: "appearance" as const,
    ...REFLECTION_APPEARANCE_DEFAULTS,
  };
}

function copyFields() {
  return {
    reflectionHeading: "Reflection",
    reflectionBody: pt(BODY!),
    nextStepsHeading: "Next Steps",
    nextStepsItems: STEPS,
    appearance: appearance(),
  };
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  let idx = sections.findIndex((s) => s._type === "reflectionSection");
  const highlightIdx = sections.findIndex((s) => s._type === "highlightReel");

  if (APPEARANCE_ONLY) {
    if (idx < 0) throw new Error(`${docId}: no reflectionSection`);
    if (!DRY) {
      await client
        .patch(docId)
        .set({ [`sections[${idx}].appearance`]: appearance() })
        .commit();
    }
    console.log(`✓ ${docId}: reflection appearance #171717${DRY ? " (dry)" : ""}`);
    return true;
  }

  if (idx < 0) {
    const insertAt = highlightIdx >= 0 ? highlightIdx + 1 : sections.length;
    sections.splice(insertAt, 0, {
      _type: "reflectionSection",
      _key: key(),
      ...copyFields(),
    });
    idx = insertAt;
    console.log(`${docId}: insert reflectionSection at sections[${idx}]`);
    if (!DRY) await client.patch(docId).set({ sections }).commit();
  } else {
    console.log(`${docId}: patch reflectionSection at sections[${idx}]`);
    if (!DRY) {
      await client
        .patch(docId)
        .set(
          Object.fromEntries(
            Object.entries(copyFields()).map(([k, v]) => [
              `sections[${idx}].${k}`,
              v,
            ]),
          ),
        )
        .commit();
    }
  }

  console.log(
    `✓ ${docId}: Reflection + ${STEPS.length} next step(s)${DRY ? " (dry)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-memory-tubes-reflection (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  if (!BODY || !STEPS.length) {
    throw new Error(`missing ${SLUG}.reflection in caseStudyCollabCopy.json`);
  }

  const pub = await client.fetch<{ _id: string }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`Missing published ${SLUG}`);

  await patchDoc(pub._id);
  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
