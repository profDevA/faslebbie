/**
 * Life of a Miner — Cards slider gets full-bleed VR screens (Nov 13 call:
 * Fas, "mimic the exact one" = horizonx.so/explore/lumina; the slider's
 * cards are full-bleed images there).
 *
 * The 12 old-site `Root-VR_DI_slider_*` composites are transparent PNGs of two
 * tablet mockups, so the card never fills. This swaps the slider items for
 * the VR screens cropped out of those composites
 * (../exports/oldsite-2026-11-11/life-of-a-miner-vr/screens/NN.png, made by
 * the Nov 13 crop script) — a **placeholder** until Fas's starred stills come
 * out of Figma (docs/meetings/2026-11-13-actions.md, item 2). The composites
 * themselves stay in Sanity for the Design Interventions grid
 * (patch-miner-grid-tiles-nov13.ts).
 *
 * Dry by default: lists the files and the slider before / after.
 * `-- --apply`: uploads the crops (reused by sha1 if already in the dataset),
 * backs the document up, sets `sections[_key=="273773ba231c"].items` under
 * ifRevisionId (published + draft). Refuses if the slider does not currently
 * hold the 12 composites (so it never runs over the Figma stills).
 *
 *   npx sanity exec scripts/patch-miner-slider-screens-nov13.ts --with-user-token [-- --apply]
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, type Doc, type ImageRef, type Section, client, fetchDocs, image, showcaseItem, uploadedCount } from "./lib/structure-nov11";

const DOC_ID = "cs-life-of-a-miner-vr";
const SLIDER_KEY = "273773ba231c";
const SCREENS = join(process.cwd(), "..", "exports", "oldsite-2026-11-11", "life-of-a-miner-vr", "screens");
/**
 * Which crops go in (NN.png). The crop script got 18 screens out of 9
 * composites (6, 11 and 12 have a different layout and were skipped):
 * odd = top screen, even = bottom. Twelve distinct scenes by default.
 */
const PICK = (process.env.MINER_SCREENS ?? "01,02,03,04,05,06,07,09,11,13,15,17").split(",").map((s) => s.trim());

type Item = { _key: string; image?: ImageRef; caption?: string };

function section(doc: Doc, k: string, type: string): Section {
  const s = doc.sections.find((x) => x._key === k);
  if (!s) throw new Error(`${doc._id}: section ${k} not found`);
  if (s._type !== type) throw new Error(`${doc._id}: ${k} is ${s._type}, expected ${type}`);
  return s;
}

async function main() {
  console.log(`patch-miner-slider-screens-nov13 (${APPLY ? "APPLY" : "dry"})`);
  if (!existsSync(SCREENS)) throw new Error(`missing ${SCREENS} — run the crop script first`);
  const have = readdirSync(SCREENS).filter((f) => /^\d\d\.png$/.test(f)).sort();
  const files = PICK.map((n) => `${n}.png`);
  const absent = files.filter((f) => !have.includes(f));
  if (absent.length) throw new Error(`missing crops: ${absent.join(", ")} (have ${have.join(", ")})`);
  console.log(`  crops: ${files.join(", ")} of ${have.length} in screens/`);

  const plans: { doc: Doc; items: ReturnType<typeof showcaseItem>[] }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const slider = section(doc, SLIDER_KEY, "showcaseGallery");
    const items = (slider.items as Item[] | undefined) ?? [];
    console.log(`\n${doc._id} (rev ${doc._rev}) slider: ${items.length} item(s), sliderStyle=${String(slider.sliderStyle ?? "(unset)")}`);
    if (items.length !== 12) throw new Error(`expected the 12 old-site composites in the slider, found ${items.length} — not touching it`);
    const refs: ImageRef[] = [];
    for (const f of files) refs.push(await image(join(SCREENS, f)));
    const next = refs.map((r) => showcaseItem(r));
    console.log(`  before: ${items.map((i) => (i.image?.asset?._ref ?? "?").slice(6, 16)).join(", ")}`);
    console.log(`  after : ${next.map((i) => i.image.asset._ref.slice(6, 16)).join(", ")}`);
    plans.push({ doc, items: next });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `miner-slider-screens-nov13-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, items } of plans) {
    const res = await client
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({ [`sections[_key=="${SLIDER_KEY}"].items`]: items })
      .commit<Doc>();
    console.log(`✓ ${doc._id}: slider items set (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
