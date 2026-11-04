/**
 * Israel's "Final QA" doc (Nov 4) Q3 / Q4 — Project Highlights "needs to be
 * updated" for Acme and DVA (docs/meetings/2026-11-04-qa-actions.md).
 *
 * Figma (Final Cleanup, XIAN): Acme 239:27754 and DVA 239:31974 are 2 × 3 grids of
 * Israel's matted tiles; two tiles in each are still blank (Acme: Sakib's
 * Finicity video; DVA: Israel's row 56). The four finished tiles go live now as
 * a grid; with four cells the site shows a centred 2 × 2 at the 2 × 3 cell size,
 * and adding the last two later makes it the 2 × 3.
 *
 *   Acme (2e1aad93a50f): composite board → grid, 4 tiles, matte #549FD7 (tile mat).
 *   DVA  (27e7cfbe4fb2): composite board → grid, 4 tiles, matte #808080,
 *                        band #A4856E → #999999, title #FFFFFF → #171717 (Figma).
 *
 * Tiles: ../exports/figma-2026-11-04/highlights-<study>/01–04.png (cropped at 3×
 * from the Figma band export). The old composite board stays in Studio (hidden
 * while layout = grid). One revision-guarded patch per doc (+ draft if any).
 * Dry by default; --apply backs the docs up to ../exports/sanity-backups/ first.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-qa-highlights-nov4.ts --with-user-token
 *   npx sanity exec scripts/patch-qa-highlights-nov4.ts --with-user-token -- --apply
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
const color = (hex: string) => ({ _type: "color", alpha: 1, hex });
const TILES = ["01.png", "02.png", "03.png", "04.png"];

const TARGETS = [
  { doc: "cs-acme-lending", sectionKey: "2e1aad93a50f", dir: "highlights-acme", extra: { gridCellMatteColor: color("#549fd7") } },
  {
    doc: "cs-diamond-valuation-ai",
    sectionKey: "27e7cfbe4fb2",
    dir: "highlights-dva",
    extra: {
      gridCellMatteColor: color("#808080"),
      "appearance.backgroundColor": color("#999999"),
      "appearance.textColor": color("#171717"),
    },
  },
];

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

async function main() {
  console.log(`patch-qa-highlights-nov4 (${APPLY ? "APPLY" : "dry"})`);
  const plan: { t: (typeof TARGETS)[number]; doc: Doc }[] = [];
  for (const t of TARGETS) {
    for (const f of TILES) if (!existsSync(join(EXPORTS, t.dir, f))) throw new Error(`missing export ${t.dir}/${f}`);
    for (const id of [t.doc, `drafts.${t.doc}`]) {
      const doc = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id });
      if (!doc) continue;
      const s = doc.sections.find((x) => x._key === t.sectionKey);
      if (!s || s._type !== "highlightReel") throw new Error(`${id}: highlightReel ${t.sectionKey} not found`);
      const app = (s.appearance ?? {}) as Record<string, { hex?: string }>;
      console.log(`• ${id} — layout ${JSON.stringify(s.layout)} → "grid", cells ${(s.cells as unknown[] | undefined)?.length ?? 0} → 4 (${t.dir}); ${Object.keys(t.extra).map((k) => `${k} ${k.startsWith("appearance.") ? app[k.split(".")[1]]?.hex ?? "∅" : "∅"} → ${(t.extra as Record<string, { hex: string }>)[k].hex}`).join("; ")}`);
      plan.push({ t, doc });
    }
  }
  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `qa-highlights-nov4-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
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
      const base = `sections[_key=="${t.sectionKey}"]`;
      const sets: Record<string, unknown> = { [`${base}.layout`]: "grid", [`${base}.cells`]: cells, [`${base}.gridGap`]: 14 };
      for (const [k, v] of Object.entries(t.extra)) sets[`${base}.${k}`] = v;
      await client.patch(doc._id).ifRevisionId(doc._rev).setIfMissing({ [`${base}.appearance`]: { _type: "appearance" } }).set(sets).commit();
    }
  }
  console.log(`${APPLY ? "✓ patched" : "would patch"} ${plan.length} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
