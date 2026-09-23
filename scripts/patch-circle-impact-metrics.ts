/**
 * Circle Impact — Figma `4171:33540`.
 *
 * Sage `#e6ece8`, title Impact, three metrics left → right:
 *   35M+ Users Impacted
 *   13pts Average Increase
 *   47% Credit Score Improvement
 *
 * The frame copy is Experian Boost (credit score / credit-invisible). Circle has
 * no collab or live metrics yet, so this is the provisional frame text.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-impact-metrics.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-impact-metrics.ts --with-user-token
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-circle";

const BAND_BG = "#e6ece8";
const TEXT = "#171717";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const ITEMS = [
  {
    _type: "statItem" as const,
    _key: key(),
    value: 35,
    suffix: "M+",
    label: "Users Impacted",
    note: "Transforming financial opportunities for credit-invisible Americans nationwide",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 13,
    suffix: "pts",
    label: "Average Increase",
    note: "Credit score improvement, helping users qualify for apartments and better loans",
  },
  {
    _type: "statItem" as const,
    _key: key(),
    value: 47,
    suffix: "%",
    label: "Credit Score Improvement",
    note: "Users experiencing meaningful credit growth and financial recognition",
  },
];

function appearance() {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
  };
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;
  const sections = (doc.sections ?? []) as { _type: string }[];
  const i = sections.findIndex((s) => s._type === "statsSection");
  if (i < 0) throw new Error(`${docId}: no statsSection`);

  console.log(`${docId}: Impact 35M+ / 13pts / 47% · ${BAND_BG}`);
  if (!DRY) {
    await client
      .patch(docId)
      .set({
        [`sections[${i}].sectionTitle`]: "Impact",
        [`sections[${i}].items`]: ITEMS,
        [`sections[${i}].appearance`]: appearance(),
      })
      .commit();
  }
  console.log(`✓ ${docId}${DRY ? " (dry)" : ""}`);
  return true;
}

async function main() {
  console.log(`patch-circle-impact-metrics (${DRY ? "dry" : "live"})`);
  const patched = await patchDoc(PUB_ID);
  if (!patched) throw new Error(`Missing document ${PUB_ID}`);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
