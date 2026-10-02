/**
 * Append a second placeholder field note when only one exists — so Field Notes
 * Next/Previous can be tested (Fas Oct 2026). Does not replace or remove notes.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-research-field-notes-dummy-second.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type FieldNoteDoc = {
  _key?: string;
  _type?: string;
  place?: string;
  quote?: string;
  methodology?: string;
  themes?: string;
  insight?: string;
  image?: { _type?: string; asset?: { _ref?: string } };
};

async function main() {
  const doc = await client.fetch<{ fieldNotes?: FieldNoteDoc[] }>(
    `*[_id == "researchPage"][0]{ fieldNotes }`,
  );
  const before = doc?.fieldNotes?.length ?? 0;
  console.log(`before: ${before} field note(s)`);

  const placeholderCount = (doc?.fieldNotes ?? []).filter((n) =>
    n.place?.startsWith("Placeholder — second field note"),
  ).length;
  if (before >= 2 && placeholderCount === 0) {
    console.log("✓ already 2+ real field notes — no change");
    return;
  }
  if (before >= 2 && placeholderCount > 0) {
    console.log(
      `⚠ ${before} notes incl. ${placeholderCount} placeholder(s) — run patch-research-field-notes-remove-dummies.ts first, or add real notes in Studio`,
    );
    return;
  }
  if (before === 0) {
    throw new Error("researchPage has no fieldNotes — add one in Studio first");
  }

  const first = doc!.fieldNotes![0];
  const second: FieldNoteDoc = {
    _type: "researchFieldNote",
    _key: key(),
    place: "Placeholder — second field note",
    quote: "Dummy caption for pager QA (replace in Studio)",
    methodology: first.methodology ?? "Relational, systemic, and multi-sited.",
    themes: "Placeholder · QA · Pager",
    insight:
      "Temporary second card so Previous / Next swaps the whole Field Notes modal. Israel can replace copy and image.",
    ...(first.image ? { image: first.image } : {}),
  };

  await client.patch("researchPage").append("fieldNotes", [second]).commit();

  const afterNotes = await client.fetch<FieldNoteDoc[] | null>(
    `*[_id == "researchPage"][0].fieldNotes`,
  );
  const after = afterNotes?.length ?? 0;
  console.log(`after: ${after} field note(s)`);
  if (after < 2) {
    console.warn(
      "⚠ expected 2 notes — check Studio / dataset token; footer still shows with 1 note (Next disabled until 2+).",
    );
  } else {
    console.log("✓ appended dummy second field note");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
