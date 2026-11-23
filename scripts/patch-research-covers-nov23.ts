/**
 * Research popups: put the Mineral Choreography book cover back on Paradigms,
 * Principles and Modalities (mobile QA M6 — the "empty top" was the white
 * placeholder square of a missing cover; Fas / Israel asked for this cover on
 * Aug 25, it was live on Sep 30, empty since at least Nov 1). Xian, Nov 23:
 * "go with A, apply". Items: docs/meetings/2026-11-23-mobile-qa.md M6.
 *
 * Reuses the existing asset `words-mineral-choreography-vol1-cover.png`
 * (1300 × 1680 = 2× Figma 3550:2781, same artwork, already used on
 * Words · Media) — no upload. Sets only `<section>.image` where it is empty;
 * a section that already has a cover is left alone. Published + any draft.
 * Dry by default; `-- --apply` backs up and patches under ifRevisionId.
 * Undo: clear the image in Studio (Research Page → Paradigms / Principles /
 * Modalities).
 *
 *   npx sanity exec scripts/patch-research-covers-nov23.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });
const ASSET = "image-8c9eaf9718eaec87551b3c94c2379a88dd9dc937-1300x1680-png";
const SECTIONS = ["paradigms", "principles", "modalities"] as const;

type Sec = { image?: { asset?: { _ref?: string } } | null; label?: string } | null;
type Doc = { _id: string; _rev: string } & Partial<Record<(typeof SECTIONS)[number], Sec>>;

async function main() {
  console.log(`patch-research-covers-nov23 (${APPLY ? "APPLY" : "dry"})`);
  const asset = await client.fetch<{ _id: string; originalFilename?: string; w?: number; h?: number } | null>(
    `*[_id == $id][0]{ _id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }`,
    { id: ASSET },
  );
  if (!asset) throw new Error(`refusing: asset ${ASSET} not found`);
  console.log(`cover asset: ${asset.originalFilename} ${asset.w}×${asset.h}`);

  const docs = await client.fetch<Doc[]>(
    `*[_id in ["researchPage", "drafts.researchPage"]]{ _id, _rev, paradigms{ _type, image, label }, principles{ _type, image, label }, modalities{ _type, image, "label": kicker } }`,
  );
  if (!docs.some((d) => d._id === "researchPage")) throw new Error("researchPage not found");

  const plans: { doc: Doc; set: Record<string, unknown>; before: Record<string, unknown> }[] = [];
  for (const doc of docs) {
    const set: Record<string, unknown> = {};
    const before: Record<string, unknown> = {};
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    for (const k of SECTIONS) {
      const sec = doc[k];
      if (!sec) throw new Error(`refusing: ${doc._id}.${k} missing`);
      const ref = sec.image?.asset?._ref;
      if (ref) {
        console.log(`  ${k}: already has a cover (${ref}) — left alone`);
        continue;
      }
      before[`${k}.image`] = sec.image ?? null;
      set[`${k}.image`] = { _type: "image", asset: { _type: "reference", _ref: ASSET } };
      console.log(`  ${k} ("${sec.label ?? ""}"): no cover → Mineral Choreography cover`);
    }
    if (Object.keys(set).length) plans.push({ doc, set, before });
  }

  if (!plans.length) return console.log("\nnothing to do — all three have covers");
  if (!APPLY) return console.log(`\ndry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `research-covers-nov23-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => ({ _id: p.doc._id, _rev: p.doc._rev, before: p.before })), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const p of plans) {
    const res = await client.patch(p.doc._id).ifRevisionId(p.doc._rev).set(p.set).commit();
    console.log(`✓ ${p.doc._id} (rev ${res._rev}): covers set on ${Object.keys(p.set).map((s) => s.split(".")[0]).join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
