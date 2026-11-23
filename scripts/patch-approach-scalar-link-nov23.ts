/**
 * Approach → How I Lead → "Scalar Leadership Approach" reveal: link
 * "my Scalar Framework" to the Research page, red underlined (Fas, Nov 22 call
 * 11:00–11:41; Xian, Nov 23: "go with red underline"). Items:
 * docs/meetings/2026-11-22-actions.md #4.
 *
 * Sets only the pill's two new fields — "Link in the reveal: words" (linkText)
 * and "…: URL or path" (linkHref) — on the one grey pill whose reveal copy
 * contains the words. The reveal text itself doesn't change. Needs the code
 * that reads those fields (LeadershipContent `RevealCopy`); older code ignores
 * them. Refuses unless exactly one pill matches; a re-run is a no-op.
 * Published + any draft. Dry by default; `-- --apply` backs up and patches
 * under ifRevisionId. Undo: clear both fields in Studio.
 *
 *   npx sanity exec scripts/patch-approach-scalar-link-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const WORDS = "my Scalar Framework";
const HREF = "/research";

type MarkDef = { _key: string; _type: string; expansion?: string; linkText?: string; linkHref?: string };
type Para = { _key: string; markDefs?: MarkDef[]; children?: { text?: string; marks?: string[] }[] };
type Doc = { _id: string; _rev: string; sections?: { _key: string; title?: string; blocks?: { _key: string; body?: Para[] }[] }[] };

async function main() {
  console.log(`patch-approach-scalar-link-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const docs = await client.fetch<Doc[]>(`*[_id in ["leadershipPage", "drafts.leadershipPage"]]{ _id, _rev, sections }`);
  if (!docs.some((d) => d._id === "leadershipPage")) throw new Error("leadershipPage not found");

  const plans: { doc: Doc; path: string; md: MarkDef; pill: string }[] = [];
  for (const doc of docs) {
    const hits = (doc.sections ?? []).flatMap((s) =>
      (s.blocks ?? []).flatMap((b) =>
        (b.body ?? []).flatMap((p) =>
          (p.markDefs ?? [])
            .filter((m) => m._type === "expandPill" && (m.expansion ?? "").includes(WORDS))
            .map((m) => ({
              section: (s.title ?? "").trim(),
              pill: (p.children ?? []).filter((c) => c.marks?.includes(m._key)).map((c) => c.text).join(""),
              md: m,
              path: `sections[_key=="${s._key}"].blocks[_key=="${b._key}"].body[_key=="${p._key}"].markDefs[_key=="${m._key}"]`,
            })),
        ),
      ),
    );
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    if (hits.length !== 1) throw new Error(`refusing: "${WORDS}" is in ${hits.length} pill reveals (want 1)`);
    const h = hits[0];
    console.log(`  ${h.section} → pill "${h.pill}"`);
    console.log(`  reveal: ${h.md.expansion}`);
    console.log(`  link words: ${JSON.stringify(h.md.linkText ?? null)} → "${WORDS}"   href: ${JSON.stringify(h.md.linkHref ?? null)} → "${HREF}"`);
    if (h.md.linkText === WORDS && h.md.linkHref === HREF) {
      console.log("  already set — nothing to do");
      continue;
    }
    plans.push({ doc, path: h.path, md: h.md, pill: h.pill });
  }

  if (!plans.length) return console.log("\nnothing to do");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `approach-scalar-link-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, path: p.path, markDef: p.md })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plans) {
    const res = await client
      .patch(p.doc._id)
      .ifRevisionId(p.doc._rev)
      .set({ [`${p.path}.linkText`]: WORDS, [`${p.path}.linkHref`]: HREF })
      .commit();
    console.log(`✓ ${p.doc._id} (rev ${res._rev}): "${p.pill}" reveal links "${WORDS}" → ${HREF}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
