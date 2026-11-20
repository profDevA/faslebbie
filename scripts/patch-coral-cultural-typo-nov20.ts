/**
 * Coral Overview, Research & Design list: "ultural Competency Frameworks" →
 * "Cultural Competency Frameworks" (seen on the Nov 19 QA call, 55:40; Xian,
 * Nov 20: "go").
 *
 * Changes only that word in `serviceList` of Coral's Overview section(s), in
 * the published document and any draft. Refuses if the typo isn't found; a
 * re-run after the fix is a no-op. Dry by default; `-- --apply` backs up and
 * patches under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-coral-cultural-typo-nov20.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const TYPO = /(^|[\s·,])ultural Competency/; // test (no /g: .test() would keep state)
const TYPO_ALL = /(^|[\s·,])ultural Competency/g; // replace every occurrence

type Ov = { _key: string; serviceList?: string };
type Doc = { _id: string; _rev: string; ovs?: Ov[] };

async function main() {
  console.log(`patch-coral-cultural-typo-nov20 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(
    `*[_id in ["cs-coral-health", "drafts.cs-coral-health"]]{ _id, _rev, "ovs": sections[_type == "overviewSection"]{ _key, serviceList } }`,
  );
  const plan = docs.flatMap((d) =>
    (d.ovs ?? [])
      .filter((o) => o.serviceList && TYPO.test(o.serviceList))
      .map((o) => ({ doc: d, ov: o, next: o.serviceList!.replace(TYPO_ALL, "$1Cultural Competency") })),
  );
  if (!plan.length) return console.log("typo not found — nothing to do");
  for (const p of plan) {
    console.log(`\n${p.doc._id} (rev ${p.doc._rev}) Overview ${p.ov._key}`);
    console.log(`  before: ${p.ov.serviceList}`);
    console.log(`  after:  ${p.next}`);
  }
  if (!APPLY) return console.log("\ndry run — nothing written (re-run with -- --apply)");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `coral-cultural-typo-nov20-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plan.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, key: p.ov._key, serviceList: p.ov.serviceList })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plan) {
    const res = await client
      .patch(p.doc._id)
      .ifRevisionId(p.doc._rev)
      .set({ [`sections[_key=="${p.ov._key}"].serviceList`]: p.next })
      .commit();
    console.log(`✓ ${p.doc._id} (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
