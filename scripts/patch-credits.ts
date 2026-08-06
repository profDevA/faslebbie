/**
 * Move every case study from the preformatted `cardCredits` string to the
 * `cardCreditNames` list, so the card joins the names itself. Fas 08/05 flagged
 * the punctuation the old string produced. Names come from the existing value
 * when there is one, otherwise from the WORK_CREDIT_NAMES placeholder.
 *
 * Lightweight — two fields, no asset re-uploads. Safe to re-run.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-credits.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { WORK_CREDIT_NAMES } from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });

// "Credit: Jane Doe,\nSabrina Fessler, John Doe" -> the three names.
const parseNames = (value?: string) =>
  (value ?? "")
    .replace(/^\s*credits?\s*:/i, "")
    .split(/[,\n&]+/)
    .map((n) => n.trim())
    .filter(Boolean);

async function main() {
  const docs: { _id: string; cardCredits?: string; cardCreditNames?: string[] }[] =
    await client.fetch(`*[_type == "caseStudy"]{ _id, cardCredits, cardCreditNames }`);
  console.log(`Patching credits on ${docs.length} case studies…`);

  let tx = client.transaction();
  for (const doc of docs) {
    const names = doc.cardCreditNames?.length
      ? doc.cardCreditNames
      : parseNames(doc.cardCredits);
    tx = tx.patch(doc._id, (p) =>
      p
        .set({ cardCreditNames: names.length ? names : WORK_CREDIT_NAMES })
        .unset(["cardCredits"]),
    );
  }
  await tx.commit();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
