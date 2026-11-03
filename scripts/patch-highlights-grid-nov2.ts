/**
 * Project Highlights → the established 2 × 3 grid (Coral) with Israel's six
 * tiles from the Final Cleanup Figma (XIAN page; "I'm using two by three for
 * everything now", recording #2681 6:27; docs/meetings/2026-11-02-2-actions.md).
 *
 *   Experian (fcca7acf339e): composite board → grid, tiles from Figma 239:22127.
 *   Census   (ae34919d6e67): composite 3×3 board → grid of 6, tiles from Figma 239:45721.
 * Acme and DVA are not here: their Figma grids still hold two empty tiles
 * (Finicity video from Sakib; DVA assets "not started").
 * FDE's new Highlights band is part of patch-fde-restructure-nov2.ts.
 *
 * Each tile export carries its own mat, so it fills the cell plate (inset 0).
 * The old composite image stays in Studio (hidden while layout = grid) as a
 * fallback. Images: ../exports/figma-2026-11-02/highlights-<study>/01–06.png.
 * Addressed by _key, revision-guarded, published doc + draft. Dry by default.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-highlights-grid-nov2.ts --with-user-token
 *   npx sanity exec scripts/patch-highlights-grid-nov2.ts --with-user-token -- --apply
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const APPLY = process.argv.includes("--apply");
const EXPORTS = join(process.cwd(), "..", "exports", "figma-2026-11-02");
const BACKUPS = join(process.cwd(), "..", "exports", "sanity-backups");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const TILES = ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png"];

const TARGETS = [
  { slug: "experian-boost", sectionKey: "fcca7acf339e", dir: "highlights-experian", matte: "#ffffff" },
  { slug: "2020-us-census-benefit-calculator", sectionKey: "ae34919d6e67", dir: "highlights-census", matte: "#c3d1ed" },
];

type Section = { _key: string; _type: string } & Record<string, unknown>;
type Doc = { _id: string; _rev: string; sections: Section[] };

async function main() {
  console.log(`patch-highlights-grid-nov2 (${APPLY ? "APPLY" : "dry"})`);
  // Read everything first so the backup is on disk before any write.
  const plan: { t: (typeof TARGETS)[number]; doc: Doc }[] = [];
  for (const t of TARGETS) {
    for (const f of TILES) if (!existsSync(join(EXPORTS, t.dir, f))) throw new Error(`missing export ${t.dir}/${f}`);
    const id = await client.fetch<string>(`*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`, { slug: t.slug });
    for (const docId of [id, `drafts.${id}`]) {
      const doc = await client.fetch<Doc | null>(`*[_id == $id][0]`, { id: docId });
      if (!doc) continue;
      const s = doc.sections.find((x) => x._key === t.sectionKey);
      if (!s || s._type !== "highlightReel") throw new Error(`${docId}: highlightReel ${t.sectionKey} not found`);
      console.log(`\n• ${docId} — layout ${JSON.stringify(s.layout)} → "grid", cells ${(s.cells as unknown[] | undefined)?.length ?? 0} → 6 (${t.dir}), matte → ${t.matte}`);
      plan.push({ t, doc });
    }
  }
  if (APPLY) {
    mkdirSync(BACKUPS, { recursive: true });
    const file = join(BACKUPS, `highlights-grid-nov2-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(file, JSON.stringify(plan.map((p) => p.doc), null, 1));
    console.log(`\nbackup → ${file}`);
    const refsByDir = new Map<string, string[]>();
    for (const { t, doc } of plan) {
      if (!refsByDir.has(t.dir)) {
        const refs: string[] = [];
        for (const f of TILES) {
          const asset = await client.assets.upload("image", createReadStream(join(EXPORTS, t.dir, f)), { filename: `${t.slug}-highlight-${f}` });
          refs.push(asset._id);
        }
        refsByDir.set(t.dir, refs);
      }
      const cells = refsByDir.get(t.dir)!.map((ref) => ({ _key: key(), _type: "highlightCell", frames: [{ _key: key(), _type: "image", asset: { _type: "reference", _ref: ref } }] }));
      const base = `sections[_key=="${t.sectionKey}"]`;
      await client
        .patch(doc._id)
        .ifRevisionId(doc._rev)
        .set({ [`${base}.layout`]: "grid", [`${base}.cells`]: cells, [`${base}.gridGap`]: 14, [`${base}.gridCellMatteColor`]: { _type: "color", alpha: 1, hex: t.matte } })
        .commit();
    }
  }
  console.log(`\n${APPLY ? "✓ patched" : "would patch"} ${plan.length} document(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
