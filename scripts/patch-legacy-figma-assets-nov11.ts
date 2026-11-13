/**
 * The four legacy studies — swap the old-site placeholder images for the Figma
 * assets Xian linked on Nov 11 (Final Cleanup 4O6ko9fovLnjtUJotdcgmx; exports in
 * ../exports/figma-2026-11-11/, per-study notes in docs/case-studies/<slug>.md).
 * Xian, Nov 11: "you didn't use the correct asset, for example the mobile hero
 * image for Life of a Miner … I shared already full figma links."
 *
 * Targeted field sets by section `_key` (nothing is inserted or removed):
 *   Galderma      coverflow items → 10 Figma screens (67:12550…); Research
 *                 Artifacts items → 8 Figma cards (65:10501…). Hero already Figma.
 *   Life of a Miner  hero image + imageMobile → 618:22741 / 618:23810 (3×);
 *                 VR Journey poster → the VR-app card from the frame (618:21951).
 *   Vuforia Editor  hero image + imageMobile → 720:15174 / 786:15928 rebuilt
 *                 without the baked placeholder text; Research Artifacts → 6
 *                 (786:15940…); Expert Capture Flow → 10 (71:44761: 6 on the
 *                 page, 10 in the popup); Speech to Text grid → 6 (71:31240, all
 *                 on the page); Speech to Text laptop poster → its first screen.
 *   Vuforia Chalk  hero image → 51:142712 rebuilt without text (mobile hero is
 *                 blank in Figma — left as is); RealWear photo band + mobile
 *                 composite band posters → the Figma cards (51:142966 /
 *                 51:143367); RealWear grid → 10 (51:126535…); mobile grid → 20
 *                 (51:120549…).
 * Dry by default (no uploads, no writes); `-- --apply` uploads, backs the
 * documents up to ../exports/sanity-backups/ and commits under ifRevisionId.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-legacy-figma-assets-nov11.ts --with-user-token
 *   npx sanity exec scripts/patch-legacy-figma-assets-nov11.ts --with-user-token -- --apply
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  APPLY,
  BACKUPS,
  type Doc,
  type ImageRef,
  type Section,
  ceScreen,
  client,
  fetchDocs,
  galleryItem,
  image,
  key,
  showcaseItem,
  uploadedCount,
} from "./lib/structure-nov11";

const FIGMA = join(process.cwd(), "..", "exports", "figma-2026-11-11");
const f = (...p: string[]) => join(FIGMA, ...p);
const nn = (n: number) => String(n).padStart(2, "0");
const series = (dir: string, count: number) => Array.from({ length: count }, (_, i) => f(dir, `${nn(i + 1)}.png`));

type Plan = { doc: Doc; sets: Record<string, unknown>; notes: string[] };

/** Section lookup with a type guard; drafts that lack the key are skipped with a note. */
function section(doc: Doc, k: string, type: string): Section | null {
  const s = doc.sections.find((x) => x._key === k);
  if (!s) {
    if (doc._id.startsWith("drafts.")) return null;
    throw new Error(`${doc._id}: section ${k} not found`);
  }
  if (s._type !== type) throw new Error(`${doc._id}: ${k} is ${s._type}, expected ${type}`);
  return s;
}

const count = (v: unknown) => (Array.isArray(v) ? v.length : 0);
const imgName = (v: unknown) => {
  const ref = (v as { asset?: { _ref?: string } } | undefined)?.asset?._ref ?? "";
  return ref ? ref.replace(/^image-/, "").slice(0, 10) + "…" : "(none)";
};

async function items(paths: string[]) {
  const out = [];
  for (const p of paths) out.push(showcaseItem(await image(p)));
  return out;
}

async function refs(paths: string[]): Promise<ImageRef[]> {
  const out: ImageRef[] = [];
  for (const p of paths) out.push(await image(p));
  return out;
}

async function planGalderma(doc: Doc): Promise<Plan> {
  const sets: Record<string, unknown> = {};
  const notes: string[] = [];
  const cover = section(doc, "b48ff65b502a", "showcaseGallery");
  if (cover) {
    sets[`sections[_key=="b48ff65b502a"].items`] = await items(series("galderma/coverflow", 10));
    notes.push(`Design Interventions coverflow: ${count(cover.items)} old-site screens → 10 Figma (67:12550…)`);
  }
  const ra = section(doc, "1835c843acbe", "showcaseGallery");
  if (ra) {
    sets[`sections[_key=="1835c843acbe"].items`] = await items(series("galderma/artifacts", 8));
    notes.push(`Research Artifacts: ${count(ra.items)} old-site → 8 Figma (65:10501…)`);
  }
  return { doc, sets, notes };
}

async function planMiner(doc: Doc): Promise<Plan> {
  const sets: Record<string, unknown> = {};
  const notes: string[] = [];
  const hero = section(doc, "212fc64e2d5a", "heroSection");
  if (hero) {
    sets[`sections[_key=="212fc64e2d5a"].image`] = await image(f("life-of-a-miner-vr", "hero-desktop-618-22741@3x.png"));
    sets[`sections[_key=="212fc64e2d5a"].imageMobile`] = await image(f("life-of-a-miner-vr", "hero-mobile-618-23810@3x.png"));
    notes.push(`hero: image ${imgName(hero.image)} → Figma 618:22741 (4320×2628); imageMobile ${imgName(hero.imageMobile)} → Figma 618:23810 (1179×2160)`);
  }
  const journey = section(doc, "8f09769d0424", "desktopMotionShowcase");
  if (journey) {
    sets[`sections[_key=="8f09769d0424"].posterImage`] = await image(f("life-of-a-miner-vr", "band-vr-card-618-21951@2x.png"));
    sets[`sections[_key=="8f09769d0424"].appearance.containerMaxWidth`] = 1168;
    notes.push(`VR Journey poster: old storyboard → Figma VR-app card 618:21951 (2336×1619 incl. shadow; container 1168)`);
  }
  return { doc, sets, notes };
}

async function planEditor(doc: Doc): Promise<Plan> {
  const sets: Record<string, unknown> = {};
  const notes: string[] = [];
  const hero = section(doc, "e3534510519a", "heroSection");
  if (hero) {
    sets[`sections[_key=="e3534510519a"].image`] = await image(f("vuforia-expert-capture", "hero-desktop-720-15174-notext@3x.png"));
    sets[`sections[_key=="e3534510519a"].imageMobile`] = await image(f("vuforia-expert-capture", "hero-mobile-786-15928-notext@3x.png"));
    notes.push(`hero: image ${imgName(hero.image)} → Figma 720:15174 (4320×2700, no text); imageMobile ${imgName(hero.imageMobile)} → Figma 786:15928 rebuilt (1179×2160, no text)`);
  }
  const ra = section(doc, "22eba6806493", "showcaseGallery");
  if (ra) {
    sets[`sections[_key=="22eba6806493"].items`] = await items(series("vuforia-expert-capture/artifacts", 6));
    notes.push(`Research Artifacts: ${count(ra.items)} old-site → 6 Figma (786:15940…)`);
  }
  const ecf = section(doc, "cbaf82b3ccfe", "coreExperience");
  if (ecf) {
    const all = await refs(series("vuforia-expert-capture/ecf", 10));
    sets[`sections[_key=="cbaf82b3ccfe"].previewScreens`] = all.slice(0, 6).map(ceScreen);
    sets[`sections[_key=="cbaf82b3ccfe"].popupTabs`] = [
      { _type: "deviceTab", _key: key(), label: "Expert Capture Flow", items: all.map((r) => galleryItem(r)) },
    ];
    notes.push(`Expert Capture Flow: ${count(ecf.previewScreens)} on page / ${count((ecf.popupTabs as { items?: unknown[] }[] | undefined)?.[0]?.items)} in popup (old-site) → 6 / 10 Figma (71:44761)`);
  }
  const sttGrid = section(doc, "4756d30b216b", "interventionGrid");
  if (sttGrid) {
    sets[`sections[_key=="4756d30b216b"].items`] = await items(series("vuforia-expert-capture/stt", 6));
    sets[`sections[_key=="4756d30b216b"].initialVisibleCount`] = 6;
    notes.push(`Speech to Text grid: ${count(sttGrid.items)} old-site (4 visible) → 6 Figma (71:31240), all visible`);
  }
  const sttLaptop = section(doc, "861ce06e8586", "desktopMotionShowcase");
  if (sttLaptop) {
    sets[`sections[_key=="861ce06e8586"].posterImage`] = await image(f("vuforia-expert-capture/stt", "01.png"));
    notes.push(`Speech to Text laptop poster: old screen → Figma STT 01 (video from Sakib later)`);
  }
  return { doc, sets, notes };
}

async function planChalk(doc: Doc): Promise<Plan> {
  const sets: Record<string, unknown> = {};
  const notes: string[] = [];
  const hero = section(doc, "c64d2c8ef50e", "heroSection");
  if (hero) {
    sets[`sections[_key=="c64d2c8ef50e"].image`] = await image(f("vuforia-chalk", "hero-desktop-51-142712-notext@3x.png"));
    notes.push(`hero: image ${imgName(hero.image)} → Figma 51:142712 rebuilt (4320×2700, no text); mobile hero blank in Figma — untouched`);
  }
  const realwearBand = section(doc, "c7831caea483", "desktopMotionShowcase");
  if (realwearBand) {
    sets[`sections[_key=="c7831caea483"].posterImage`] = await image(f("vuforia-chalk", "band-realwear-card-51-142966@2x.png"));
    sets[`sections[_key=="c7831caea483"].appearance.containerMaxWidth`] = 1191;
    notes.push(`Hands-Free AR Support poster: old 4-mat strip → Figma RealWear card 51:142966 (2382×1619 incl. shadow; container 1191)`);
  }
  const realwearGrid = section(doc, "8520b82cc5f3", "interventionGrid");
  if (realwearGrid) {
    sets[`sections[_key=="8520b82cc5f3"].items`] = await items(series("vuforia-chalk/realwear", 10));
    notes.push(`RealWear grid: ${count(realwearGrid.items)} old-site → 10 Figma (51:126535…)`);
  }
  const mobileBand = section(doc, "455df6df870f", "desktopMotionShowcase");
  if (mobileBand) {
    sets[`sections[_key=="455df6df870f"].posterImage`] = await image(f("vuforia-chalk", "band-mobile-card-51-143367@2x.png"));
    sets[`sections[_key=="455df6df870f"].appearance.containerMaxWidth`] = 1191;
    notes.push(`Chalk Mobile Support poster: old 4-mat strip → Figma composite card 51:143367 (2382×1619 incl. shadow; container 1191)`);
  }
  const mobileGrid = section(doc, "f6f244aa587e", "interventionGrid");
  if (mobileGrid) {
    sets[`sections[_key=="f6f244aa587e"].items`] = await items(series("vuforia-chalk/mobile", 20));
    notes.push(`mobile grid: ${count(mobileGrid.items)} old-site → 20 Figma (51:120549…)`);
  }
  return { doc, sets, notes };
}

const STUDIES: { id: string; plan: (d: Doc) => Promise<Plan> }[] = [
  { id: "cs-galderma", plan: planGalderma },
  { id: "cs-life-of-a-miner-vr", plan: planMiner },
  { id: "cs-vuforia-expert-capture", plan: planEditor },
  { id: "cs-vuforia-chalk", plan: planChalk },
];

async function main() {
  console.log(`patch-legacy-figma-assets-nov11 (${APPLY ? "APPLY" : "dry"})`);
  const plans: Plan[] = [];
  for (const { id, plan } of STUDIES) {
    for (const doc of await fetchDocs(id)) {
      const p = await plan(doc);
      if (!Object.keys(p.sets).length) {
        console.log(`\n${doc._id}: nothing to set (draft without the keys?)`);
        continue;
      }
      console.log(`\n${doc._id} (rev ${doc._rev}) — ${Object.keys(p.sets).length} field(s):`);
      for (const n of p.notes) console.log(`  • ${n}`);
      plans.push(p);
    }
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `legacy-figma-assets-nov11-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).commit<Doc>();
    console.log(`✓ ${doc._id}: ${Object.keys(sets).length} field(s) set (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
