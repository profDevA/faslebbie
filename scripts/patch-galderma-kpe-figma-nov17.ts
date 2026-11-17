/**
 * Galderma — Key Product Experiences to Israel's Figma (Final Cleanup, XIAN
 * page, section `1015:23688`). Fas, Nov 16 evening call: "we need to make
 * this bigger and spaced if you look at the design… it feels congested";
 * Xian Nov 17: "we have to fix, to match figma".
 *
 * On band `027be1d38455` of `cs-galderma` (the staggered pair from Nov 17):
 *   - `pairSize: "large"` → the renderer's Galderma geometry (555 / 551
 *     screens on a #f3f3f3 plate, right slider from the centre, 906 lower);
 *   - slider 1 image → the sign-up screen exactly as the Figma node
 *     (`1015:23692`, 4× export cropped to the screen inside the plate,
 *     2219×1387) — replaces the Nov 17 upload that had the plate + shadow
 *     margins baked in;
 *   - slider 2 image → the AART assessment exactly as the Figma node
 *     (`1015:23800`, 4× export cropped the same way, 2203×1395) — replaces
 *     Ade's Nov 13 screen (different crop, no plate);
 *   - caption leads stay `strong` (rendered regular in this layout);
 *   - each slide's `video` → a DUMMY loop of its own screen (slow 2–4 %
 *     zoom, 6 s, no audio; `ZZ-dummy-galderma-kpe-*-motion.mp4`) — Fas: "or
 *     just put a dummy video so we can replace it"; Xian Nov 17: "yes, dummy
 *     video". Sakib's export replaces it in Studio (slide → Motion video).
 *
 * Dry by default; `-- --apply` uploads the two screens (sha1 reuse), backs
 * the document up, then sets the fields by `_key` under ifRevisionId
 * (published + draft). Refuses if the band is not a staggered pair with two
 * sliders.
 *
 *   npx sanity exec scripts/patch-galderma-kpe-figma-nov17.ts --with-user-token [-- --apply]
 */
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import { APPLY, BACKUPS, type Doc, type Section, client, fetchDocs, image, uploadedCount } from "./lib/structure-nov11";

const DOC_ID = "cs-galderma";
const BAND_KEY = "027be1d38455";
const DIR = join(process.cwd(), "..", "exports", "figma-2026-11-17", "galderma");
const SIGNUP = join(DIR, "kpe-signup-1015-23692@4x-screen.png");
const ASSESSMENT = join(DIR, "kpe-assessment-1015-23800@4x-screen.png");
const DUMMY_VIDEOS = [
  join(DIR, "ZZ-dummy-galderma-kpe-signup-motion.mp4"),
  join(DIR, "ZZ-dummy-galderma-kpe-assessment-motion.mp4"),
];

/** Upload an MP4 once (reuses a file asset with the same sha1). */
async function video(absPath: string) {
  const sha1 = createHash("sha1").update(readFileSync(absPath)).digest("hex");
  let id = await client.fetch<string | null>(`*[_type == "sanity.fileAsset" && sha1hash == $sha1][0]._id`, { sha1 });
  if (id) {
    console.log(`  = ${basename(absPath)} → ${id} (already in Sanity)`);
  } else {
    const asset = await client.assets.upload("file", createReadStream(absPath), {
      filename: basename(absPath),
      contentType: "video/mp4",
    });
    id = asset._id;
    console.log(`  ↑ ${basename(absPath)} → ${id}`);
  }
  return { _type: "file", asset: { _type: "reference", _ref: id } };
}

type Carousel = { _key: string; slides?: { _key: string; image?: { asset?: { _ref?: string } } }[] };

function band(doc: Doc): Section {
  const s = doc.sections.find((x) => x._key === BAND_KEY);
  if (!s) throw new Error(`${doc._id}: band ${BAND_KEY} not found`);
  if (s._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: ${BAND_KEY} is ${s._type}`);
  if (s.layoutVariant !== "staggeredPair") throw new Error(`${doc._id}: ${BAND_KEY} is not a staggered pair`);
  return s;
}

async function main() {
  console.log(`patch-galderma-kpe-figma-nov17 (${APPLY ? "APPLY" : "dry"})`);
  for (const f of [SIGNUP, ASSESSMENT, ...DUMMY_VIDEOS]) if (!existsSync(f)) throw new Error(`missing ${f}`);
  const plans: { doc: Doc; sets: Record<string, unknown> }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const b = band(doc);
    const carousels = (b.carousels as Carousel[] | undefined) ?? [];
    if (carousels.length !== 2) throw new Error(`${doc._id}: expected 2 sliders, found ${carousels.length}`);
    const slideKeys = carousels.map((c, i) => {
      const k = c.slides?.[0]?._key;
      if (!k) throw new Error(`${doc._id}: slider ${i + 1} has no slide`);
      return k;
    });
    console.log(
      `\n${doc._id} (rev ${doc._rev}) band ${BAND_KEY}: pairSize=${String(b.pairSize ?? "(unset)")}; ` +
        carousels.map((c, i) => `slider ${i + 1} image ${c.slides?.[0]?.image?.asset?._ref ?? "-"}`).join("; "),
    );
    const p = `sections[_key=="${BAND_KEY}"]`;
    const slide = (i: number, field = "image") =>
      `${p}.carousels[_key=="${carousels[i]._key}"].slides[_key=="${slideKeys[i]}"].${field}`;
    const sets: Record<string, unknown> = { [`${p}.pairSize`]: "large" };
    if (APPLY) {
      sets[slide(0)] = await image(SIGNUP);
      sets[slide(1)] = await image(ASSESSMENT);
      sets[slide(0, "video")] = await video(DUMMY_VIDEOS[0]);
      sets[slide(1, "video")] = await video(DUMMY_VIDEOS[1]);
    }
    console.log(`  after: pairSize=large; slider 1 image = Figma 1015:23692 screen; slider 2 image = Figma 1015:23800 screen; both slides get a dummy MP4`);
    plans.push({ doc, sets });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `galderma-kpe-figma-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).commit<Doc>();
    console.log(`✓ ${doc._id}: large pair + Figma screens (rev ${res._rev})`);
  }
  console.log(`uploaded ${uploadedCount()} image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
