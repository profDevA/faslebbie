/**
 * One-off patch: refresh caseStudy.cardCredits on every case study to the
 * current placeholder (two-line WORK_CREDIT). Lightweight — patches only the
 * one field, no asset re-uploads. Safe to re-run.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-credits.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

import { WORK_CREDIT } from "../src/lib/content";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const ids: string[] = await client.fetch(`*[_type == "caseStudy"]._id`);
  console.log(`Patching cardCredits on ${ids.length} case studies…`);

  let tx = client.transaction();
  for (const _id of ids) {
    tx = tx.patch(_id, (p) => p.set({ cardCredits: WORK_CREDIT }));
  }
  await tx.commit();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
