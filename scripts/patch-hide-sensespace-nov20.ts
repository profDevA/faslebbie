/**
 * Build: hide SenseSpace AI (Fas, Nov 19 QA: "remove Sense space and move to
 * case studies… maybe not remove but hide"; Xian, Nov 20). Sets only
 * `hidden: true` on that one project — Studio's "Hide on site" switch — in the
 * published Build page and in a draft if one exists (so publishing the draft
 * later doesn't bring it back). Nothing else in the project changes; switch it
 * off in Studio to show it again.
 *
 * Dry by default; `-- --apply` backs up the project and patches under
 * ifRevisionId.
 *
 *   npx sanity exec scripts/patch-hide-sensespace-nov20.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const ID = "sensespace-ai";

type Doc = { _id: string; _rev: string; p?: { _key: string; id?: string; title?: string; hidden?: boolean | null } };

async function main() {
  console.log(`patch-hide-sensespace-nov20 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(
    `*[_id in ["buildPage", "drafts.buildPage"]]{ _id, _rev, "p": projects[id == $id][0]{ _key, id, title, hidden } }`,
    { id: ID },
  );
  if (!docs.some((d) => d._id === "buildPage" && d.p)) throw new Error("SenseSpace not found in the published Build page");
  const todo = docs.filter((d) => d.p && d.p.hidden !== true);
  for (const d of docs) console.log(`${d._id} (rev ${d._rev}): "${d.p?.title}" hidden ${d.p?.hidden ?? "off"} → on`);
  if (!todo.length) return console.log("already hidden — nothing to do");
  if (!APPLY) return console.log("dry run — nothing written (re-run with -- --apply)");

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `hide-sensespace-nov20-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(todo, null, 1));
  console.log(`backup → ${file}`);
  for (const d of todo) {
    const res = await client
      .patch(d._id)
      .ifRevisionId(d._rev)
      .set({ [`projects[_key=="${d.p!._key}"].hidden`]: true })
      .commit();
    console.log(`✓ ${d._id}: SenseSpace hidden (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
