/**
 * OC Links §11 Reflection + Next Steps (Figma 4003:106573).
 * Existing reflectionSection — dark #171717 band, centred copy.
 * Collab body + 3 next steps. Ignore Figma lorem / REFLECTIONS leftover.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-reflection.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-reflection.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-reflection.ts --with-user-token -- --appearance-only
 *
 * Does not touch fullCaseStudyPdf. Do not re-run migrate-pages.ts.
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { REFLECTION_APPEARANCE_DEFAULTS } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const PUB_ID = "cs-oc-links";

const COPY = (
  collab["oc-links" as keyof typeof collab] as {
    reflection?: { body?: string; nextSteps?: string[] };
  }
).reflection;

const BODY =
  COPY?.body ??
  "Measuring connection velocity instead of simple system uptime worked.";
const STEPS = COPY?.nextSteps ?? [];

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

function pt(text: string) {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
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
    reflectionBody: pt(BODY),
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
    `patch-oc-links-reflection (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  if (!BODY || !STEPS.length) {
    throw new Error("missing oc-links.reflection in caseStudyCollabCopy.json");
  }

  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
