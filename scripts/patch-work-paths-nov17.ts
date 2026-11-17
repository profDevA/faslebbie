/**
 * Work moves from /casestudies to /work (Xian, Nov 17: "for work menu, slug
 * should be also work"). The site redirects every old /casestudies… link, but
 * links stored in Sanity should point at the new address — and the nav only
 * highlights "Work" when its href matches the page.
 *
 * Scans every non-system document (published + drafts) for string fields
 * whose value is "/casestudies" or starts with "/casestudies/" or "/casestudies?"
 * (nav items, Home hero keyword links, Work / About / Teaching link marks…) and
 * rewrites the prefix to "/work". Absolute faslebbie.com/casestudies URLs are
 * rewritten the same way. Prints every path it would change.
 *
 * Dry by default; `-- --apply` backs up the touched documents and patches each
 * one under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-work-paths-nov17.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

type Doc = { _id: string; _rev: string; _type: string } & Record<string, unknown>;

const RE = /^(https?:\/\/(?:www\.)?faslebbie\.com)?\/casestudies(?=$|[/?#])/;

/** Walk a value, collecting [patchPath, before, after] for matching strings. */
function walk(v: unknown, path: string, out: [string, string, string][]) {
  if (typeof v === "string") {
    if (RE.test(v)) out.push([path, v, v.replace(RE, (_m, host: string | undefined) => `${host ?? ""}/work`)]);
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((item, i) => {
      const k = item && typeof item === "object" && "_key" in item ? `[_key=="${(item as { _key: string })._key}"]` : `[${i}]`;
      walk(item, `${path}${k}`, out);
    });
    return;
  }
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (k.startsWith("_")) continue;
      walk(val, path ? `${path}.${k}` : k, out);
    }
  }
}

async function main() {
  console.log(`patch-work-paths-nov17 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[!(_type match "sanity.*") && !(_type match "system.*")]`);
  const plans: { doc: Doc; changes: [string, string, string][] }[] = [];
  for (const doc of docs) {
    const changes: [string, string, string][] = [];
    walk(doc, "", changes);
    if (changes.length) plans.push({ doc, changes });
  }
  console.log(`scanned ${docs.length} documents; ${plans.length} with /casestudies links`);
  for (const { doc, changes } of plans) {
    console.log(`\n${doc._id} (${doc._type}, rev ${doc._rev}) — ${changes.length}`);
    for (const [p, a, b] of changes) console.log(`  ${p}: ${a} → ${b}`);
  }
  if (!APPLY || !plans.length) {
    console.log(APPLY ? "\nnothing to change" : `\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `work-paths-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, changes } of plans) {
    const sets = Object.fromEntries(changes.map(([p, , b]) => [p, b]));
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).commit();
    console.log(`✓ ${doc._id}: ${changes.length} link(s) (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
