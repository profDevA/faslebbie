/**
 * Circle gets the password gate like the other 17 studies (Fas, Nov 18 evening
 * call: "Everything should be password protected"; Xian "Circle password on",
 * Nov 19). Sets `passwordProtected: true` on the published cs-circle only —
 * shared password, no own password. Circle then drops out of /sitemap.xml
 * (open studies only).
 *
 * Dry by default; `-- --apply` backs up the two access fields and patches under
 * ifRevisionId. Refuses if a Circle draft exists.
 *
 *   npx sanity exec scripts/patch-circle-password-nov19.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

async function main() {
  console.log(`patch-circle-password-nov19 (${APPLY ? "APPLY" : "dry"})`);
  const doc = await client.fetch<{ _id: string; _rev: string; passwordProtected?: boolean; accessPassword?: string } | null>(
    `*[_type == "caseStudy" && slug.current == "circle" && !(_id in path("drafts.**"))][0]{ _id, _rev, passwordProtected, accessPassword }`,
  );
  if (!doc) throw new Error("Circle not found");
  const draft = await client.fetch<string | null>(`*[_id == "drafts." + $id][0]._id`, { id: doc._id });
  if (draft) throw new Error(`a draft exists (${draft}) — publish or discard it in Studio first`);

  console.log(`${doc._id} (rev ${doc._rev}): passwordProtected ${doc.passwordProtected} → true (own password: ${doc.accessPassword ? "set" : "none — shared password"})`);
  if (doc.passwordProtected === true) return console.log("already on — nothing to do");
  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `circle-password-nov19-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify({ _id: doc._id, _rev: doc._rev, passwordProtected: doc.passwordProtected ?? null }, null, 1));
  console.log(`backup → ${file}`);
  const res = await client.patch(doc._id).ifRevisionId(doc._rev).set({ passwordProtected: true }).commit();
  console.log(`✓ ${doc._id}: password gate on (rev ${res._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
