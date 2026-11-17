/**
 * Site Settings — Fas, Nov 16 evening call (docs/meetings/2026-11-16-evening-actions.md):
 *
 *  1. Nav labels: "Case Studies" → "Work", "Build / Playground" → "Build"
 *     ("it's gonna be Build… get rid of Playground… change this to Work").
 *     Desktop + mobile lists (navItems, mobileNavItems) and the now-unused
 *     projectNavItems, matched by href (/casestudies, /build). Hrefs and order
 *     are untouched; the code no longer renders a Projects▾ dropdown.
 *  2. Contact portrait: unset `contactPortrait`, so the Contact drawer falls
 *     back to the Home close-up (Site Settings → Home portrait) — "use the
 *     same image sizing for contact that we have across everything… this one
 *     is bigger, shows more". The asset itself stays in the media library.
 *
 * Dry by default; `-- --apply` backs the document(s) up and patches published
 * + draft under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-site-settings-nav-contact-nov17.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

type Link = { _key?: string; label?: string; href?: string };
type Settings = {
  _id: string;
  _rev: string;
  navItems?: Link[];
  mobileNavItems?: Link[];
  projectNavItems?: Link[];
  contactPortrait?: { asset?: { _ref?: string } };
};

const RENAME: Record<string, string> = { "/casestudies": "Work", "/build": "Build" };
const LISTS = ["navItems", "mobileNavItems", "projectNavItems"] as const;

function show(list?: Link[]) {
  return (list ?? []).map((l) => `${l.label} (${l.href})`).join(" · ") || "(empty)";
}

async function main() {
  console.log(`patch-site-settings-nav-contact-nov17 (${APPLY ? "APPLY" : "dry"})`);
  const id = await client.fetch<string | null>(`*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]._id`);
  if (!id) throw new Error("siteSettings not found");
  const docs: Settings[] = [];
  for (const docId of [id, `drafts.${id}`]) {
    const d = await client.getDocument<Settings>(docId);
    if (d) docs.push(d);
  }
  const plans: { doc: Settings; sets: Record<string, unknown>; unset: string[] }[] = [];
  for (const doc of docs) {
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    const sets: Record<string, unknown> = {};
    for (const name of LISTS) {
      const list = doc[name];
      console.log(`  ${name} before: ${show(list)}`);
      if (!list?.length) continue;
      let changed = 0;
      for (const l of list) {
        const to = l.href ? RENAME[l.href] : undefined;
        if (to && l.label !== to && l._key) {
          sets[`${name}[_key=="${l._key}"].label`] = to;
          changed++;
        }
      }
      const after = list.map((l) => ({ ...l, label: (l.href && RENAME[l.href]) || l.label }));
      console.log(`  ${name} after:  ${show(after)}  (${changed} label(s))`);
    }
    const unset = doc.contactPortrait ? ["contactPortrait"] : [];
    console.log(
      `  contactPortrait: ${doc.contactPortrait?.asset?._ref ?? "(unset)"} → ${unset.length ? "unset (falls back to Home portrait)" : "nothing to do"}`,
    );
    plans.push({ doc, sets, unset });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `site-settings-nav-contact-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets, unset } of plans) {
    if (!Object.keys(sets).length && !unset.length) {
      console.log(`= ${doc._id}: nothing to change`);
      continue;
    }
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).unset(unset).commit();
    console.log(`✓ ${doc._id}: ${Object.keys(sets).length} label(s), ${unset.length ? "contactPortrait unset" : "portrait unchanged"} (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
