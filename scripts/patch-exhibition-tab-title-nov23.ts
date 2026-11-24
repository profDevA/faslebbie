/**
 * Teaching → Exhibition: browser tab title of /teaching/exhibition named one
 * exhibition ("SFK Beijing Exhibition — Teaching — Fas Lebbie, Ph.D.") while
 * the page shows all of them ("My Student Exhibitions"). Sets the SEO-only
 * field `exhibitionTitle` (Studio: Teaching Page → Exhibition → "Exhibition
 * page title (SEO)") to "Student Exhibitions" → tab "Student Exhibitions —
 * Teaching — Fas Lebbie, Ph.D.". Xian, Nov 23: "go with agent, apply it".
 *
 * Only this one field; heading, intro, CTA and tiles are untouched.
 * Published + any draft. Refuses unless the current value is exactly
 * "SFK Beijing Exhibition" (re-run after apply = "already set").
 * Dry by default; `-- --apply` backs up and patches under ifRevisionId.
 * Undo: in Studio set the field back to "SFK Beijing Exhibition".
 *
 *   npx sanity exec scripts/patch-exhibition-tab-title-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const OLD = "SFK Beijing Exhibition";
const NEW = "Student Exhibitions";

type Doc = { _id: string; _rev: string; exhibitionTitle?: string | null; exhibitionHeading?: string | null };

async function main() {
  console.log(`patch-exhibition-tab-title-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(
    `*[_type == "teachingPage"]{ _id, _rev, exhibitionTitle, exhibitionHeading }`,
  );
  if (!docs.length) throw new Error("refusing: no teachingPage document found");
  const published = docs.filter((d) => !d._id.startsWith("drafts."));
  if (published.length !== 1) throw new Error(`refusing: expected 1 published teachingPage, found ${published.length}`);

  const plans: Doc[] = [];
  for (const doc of docs) {
    const cur = doc.exhibitionTitle;
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    console.log(`  heading (unchanged): "${doc.exhibitionHeading ?? ""}"`);
    if (cur === NEW) {
      console.log(`  exhibitionTitle: already "${NEW}" — left alone`);
      continue;
    }
    if (cur !== OLD) {
      throw new Error(`refusing: ${doc._id}.exhibitionTitle is ${JSON.stringify(cur ?? null)}, expected "${OLD}"`);
    }
    console.log(`  exhibitionTitle: "${OLD}" → "${NEW}"`);
    plans.push(doc);
  }

  if (!plans.length) return console.log(`\nnothing to do — already "${NEW}"`);
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `exhibition-tab-title-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(plans.map((d) => ({ _id: d._id, _rev: d._rev, before: { exhibitionTitle: d.exhibitionTitle } })), null, 1),
  );
  console.log(`\nbackup → ${file}`);
  for (const d of plans) {
    const res = await client.patch(d._id).ifRevisionId(d._rev).set({ exhibitionTitle: NEW }).commit();
    console.log(`✓ ${d._id} (rev ${res._rev}) at ${new Date().toISOString()}: exhibitionTitle = "${NEW}"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
