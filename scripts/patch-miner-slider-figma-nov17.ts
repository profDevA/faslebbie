/**
 * Life of a Miner — the Cards slider gets Fas's Figma rows (Final Cleanup,
 * XIAN page, loose images, Xian Nov 17: "first images of rows, can you find
 * others based on this?"):
 *
 *   row 1  "ChatGPT Image Aug 16…" storyboard (title, VR setup, scenes,
 *          diagrams) — anchor 63:25505, 39 unique images (3 exact duplicates
 *          skipped: 63:25513, 63:25525, 63:25546; 63:25534 sits a little low
 *          but belongs here by timestamp)
 *   row 2  "Story Page 01 → 18" hand-drawn sketches — anchor 63:16290, 13
 *   row 3  "ChatGPT Image Aug 17…" VR renders — anchor 63:25551, 16 unique
 *          (63:25560 duplicate skipped)
 *
 * 68 screens in row order, replacing the 12 cropped old-site VR screens from
 * Nov 13. The slider shows three per card (CardSlider perCard), so 23 cards.
 * Files: ../exports/figma-2026-11-17/miner-slider/web/r{1,2,3}-NN-<node>.jpg
 * (3× Figma exports → 1600 wide JPEG q86).
 *
 * Dry by default; `-- --apply` uploads (sha1 reuse), backs up, sets the
 * slider's `items` by section `_key` under ifRevisionId (published + draft).
 * Refuses unless the slider still holds the 12 Nov 13 screens.
 *
 *   npx sanity exec scripts/patch-miner-slider-figma-nov17.ts --with-user-token [-- --apply]
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, type Doc, type ImageRef, type Section, client, fetchDocs, image, showcaseItem, uploadedCount } from "./lib/structure-nov11";

const DOC_ID = "cs-life-of-a-miner-vr";
const SLIDER_KEY = "273773ba231c";
const DIR = join(process.cwd(), "..", "exports", "figma-2026-11-17", "miner-slider", "web");

type Item = { _key: string; image?: ImageRef; caption?: string };

function section(doc: Doc, k: string, type: string): Section {
  const s = doc.sections.find((x) => x._key === k);
  if (!s) throw new Error(`${doc._id}: section ${k} not found`);
  if (s._type !== type) throw new Error(`${doc._id}: ${k} is ${s._type}, expected ${type}`);
  return s;
}

async function main() {
  console.log(`patch-miner-slider-figma-nov17 (${APPLY ? "APPLY" : "dry"})`);
  if (!existsSync(DIR)) throw new Error(`missing ${DIR}`);
  const files = readdirSync(DIR).filter((f) => /^r[123]-\d\d-63_\d+\.jpg$/.test(f)).sort();
  const perRow = [1, 2, 3].map((r) => files.filter((f) => f.startsWith(`r${r}-`)).length);
  if (files.length !== 68 || perRow.join() !== "39,13,16") throw new Error(`expected 39 + 13 + 16 files, found ${perRow.join(" + ")}`);
  console.log(`  ${files.length} screens (rows ${perRow.join(" / ")}) → ${Math.ceil(files.length / 3)} cards of three`);

  const plans: { doc: Doc; items: ReturnType<typeof showcaseItem>[] }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const slider = section(doc, SLIDER_KEY, "showcaseGallery");
    const items = (slider.items as Item[] | undefined) ?? [];
    console.log(`\n${doc._id} (rev ${doc._rev}) slider "${String(slider.sectionTitle ?? "")}": ${items.length} item(s), sliderStyle=${String(slider.sliderStyle ?? "(unset)")}`);
    if (items.length !== 12) throw new Error(`expected the 12 Nov 13 screens in the slider, found ${items.length} — not touching it`);
    const next: ReturnType<typeof showcaseItem>[] = [];
    if (APPLY) for (const f of files) next.push(showcaseItem(await image(join(DIR, f))));
    console.log(`  before: 12 old-site VR crops`);
    console.log(`  after : ${files.length} Figma screens — ${files[0]} … ${files[files.length - 1]}`);
    plans.push({ doc, items: next });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `miner-slider-figma-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, items } of plans) {
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ [`sections[_key=="${SLIDER_KEY}"].items`]: items })
      .commit<Doc>();
    console.log(`✓ ${doc._id}: ${items.length} slider items set (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
