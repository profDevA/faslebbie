/**
 * Life of a Miner — Design Interventions grid gets the 12 old-site tablet
 * tiles (Nov 13 call, Fas pointing at the band: "you have the See… View more";
 * Figma 618:21960 shows six tiles + "Load More"; the renderer only shows the
 * View All button when there are more cards than the six on the page, and the
 * Nov 11 structure patch left six blank mats there).
 *
 * The 12 tiles are the `Root-VR_DI_slider_1…12` assets already uploaded for
 * the Cards slider (section 273773ba231c) — the grid items reference the same
 * asset ids, nothing is uploaded. The slider keeps its items until Fas's
 * starred stills replace them (docs/meetings/2026-11-13-actions.md, item 2).
 *
 * Dry by default: prints the slider assets and the grid before / after.
 * `-- --apply`: backs the document up to ../exports/sanity-backups/ and sets
 * `sections[_key=="a5fa213081db"].items` under ifRevisionId (published +
 * draft). Refuses if the grid already has more than six items or the slider
 * does not hold exactly twelve.
 *
 *   npx sanity exec scripts/patch-miner-grid-tiles-nov13.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, type Doc, type ImageRef, type Section, client, fetchDocs, showcaseItem } from "./lib/structure-nov11";

const DOC_ID = "cs-life-of-a-miner-vr";
const SLIDER_KEY = "273773ba231c"; // showcaseGallery, Slider style "Cards"
const GRID_KEY = "a5fa213081db"; // interventionGrid, six blank mats

type Item = { _key: string; image?: ImageRef; caption?: string };

function section(doc: Doc, k: string, type: string): Section {
  const s = doc.sections.find((x) => x._key === k);
  if (!s) throw new Error(`${doc._id}: section ${k} not found`);
  if (s._type !== type) throw new Error(`${doc._id}: ${k} is ${s._type}, expected ${type}`);
  return s;
}

const ref = (i: Item) => i.image?.asset?._ref ?? "(none)";

async function main() {
  console.log(`patch-miner-grid-tiles-nov13 (${APPLY ? "APPLY" : "dry"})`);
  const plans: { doc: Doc; items: ReturnType<typeof showcaseItem>[] }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const slider = section(doc, SLIDER_KEY, "showcaseGallery");
    const grid = section(doc, GRID_KEY, "interventionGrid");
    const sliderItems = (slider.items as Item[] | undefined) ?? [];
    const gridItems = (grid.items as Item[] | undefined) ?? [];
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    console.log(`  slider "${slider.sectionTitle ?? ""}": ${sliderItems.length} item(s)`);
    console.log(`  grid   "${grid.sectionTitle ?? ""}": ${gridItems.length} item(s), initialVisibleCount=${String(grid.initialVisibleCount ?? "(default 6)")}, readMoreLabel=${String(grid.readMoreLabel ?? "(unset)")}`);
    if (sliderItems.length !== 12) throw new Error(`expected 12 slider items, found ${sliderItems.length}`);
    if (gridItems.length > 6) throw new Error(`grid already has ${gridItems.length} items — nothing to do`);
    const missing = sliderItems.filter((i) => !i.image?.asset?._ref);
    if (missing.length) throw new Error(`${missing.length} slider item(s) without an image asset`);
    const items = sliderItems.map((i) => showcaseItem(i.image as ImageRef));
    console.log(`  before: ${gridItems.map((i) => ref(i).slice(6, 16)).join(", ")}`);
    console.log(`  after : ${items.map((i) => ref(i).slice(6, 16)).join(", ")}  (12 — the slider's assets, new keys)`);
    plans.push({ doc, items });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `miner-grid-tiles-nov13-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, items } of plans) {
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ [`sections[_key=="${GRID_KEY}"].items`]: items })
      .commit<Doc>();
    console.log(`✓ ${doc._id}: grid items set (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
