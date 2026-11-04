/**
 * Acme + DVA Project Highlights → Israel's 2 × 3 exactly as in Figma (Xian Nov 4:
 * "it's 2x3"). Follows patch-qa-highlights-nov4.ts (which set the four finished
 * tiles): appends Israel's two placeholder tiles (the blank mats in Figma
 * 239:27754 / 239:31974, slots 5–6) so the grid is 2 × 3. Replace them in
 * Studio when Sakib's Finicity video (Acme) and Israel's last DVA tiles exist.
 *
 * Images: ../exports/figma-2026-11-04/highlights-<study>/05–06.png (3× crops).
 * Only runs when the section has exactly 4 cells (refuses otherwise). One
 * revision-guarded patch per doc (+ draft if any). Dry by default; --apply
 * backs the docs up to ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-qa-highlights-2x3-nov4.ts --with-user-token
 *   npx sanity exec scripts/patch-qa-highlights-2x3-nov4.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-04");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const TILES = ["05.png", "06.png"];
const TARGETS = [
  { doc: "cs-acme-lending", sectionKey: "2e1aad93a50f", dir: "highlights-acme" },
  { doc: "cs-diamond-valuation-ai", sectionKey: "27e7cfbe4fb2", dir: "highlights-dva" },
];

type Section = { _key: string; _type: string; cells?: unknown[] } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

async function main() {
  console.log(`patch-qa-highlights-2x3-nov4 (${APPLY ? "APPLY" : "dry"})`);
  const plan: { t: (typeof TARGETS)[number]; doc: Doc }[] = [];
  for (const t of TARGETS) {
    for (const f of TILES) if (!existsSync(join(EXPORTS, t.dir, f))) throw new Error(`missing export ${t.dir}/${f}`);
    for (const id of [t.doc, `drafts.${t.doc}`]) {
      const doc = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id });
      if (!doc) continue;
      const s = doc.sections.find((x) => x._key === t.sectionKey);
      if (!s || s._type !== "highlightReel") throw new Error(`${id}: highlightReel ${t.sectionKey} not found`);
      const n = s.cells?.length ?? 0;
      if (n !== 4) throw new Error(`${id}: expected 4 cells, found ${n} — not touching it`);
      console.log(`• ${id} — cells 4 → 6 (+ ${t.dir}/05, 06 placeholders); layout ${JSON.stringify(s.layout)}`);
      plan.push({ t, doc });
    }
  }
  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `qa-highlights-2x3-nov4-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(file, JSON.stringify(plan.map((p) => p.doc), null, 1));
    console.log(`backup → ${file}`);
    const refsByDir = new Map<string, string[]>();
    for (const { t, doc } of plan) {
      if (!refsByDir.has(t.dir)) {
        const refs: string[] = [];
        for (const f of TILES) {
          const asset = await client.assets.upload("image", createReadStream(join(EXPORTS, t.dir, f)), { filename: `${t.dir}-${f}` });
          refs.push(asset._id);
        }
        refsByDir.set(t.dir, refs);
      }
      const cells = refsByDir.get(t.dir)!.map((ref) => ({ _key: key(), _type: "highlightCell", frames: [{ _key: key(), _type: "image", asset: { _type: "reference", _ref: ref } }] }));
      await client
        .patch(doc._id)
        .ifRevisionId(doc._rev)
        .insert("after", `sections[_key=="${t.sectionKey}"].cells[-1]`, cells)
        .commit();
    }
  }
  console.log(`${APPLY ? "✓ patched" : "would patch"} ${plan.length} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
