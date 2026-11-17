/**
 * Galderma — the dummy video goes in the OVERVIEW, not Key Product Experiences.
 *
 * Fas, Nov 16 evening (transcript 16:17–16:41, on screen: the Overview with the
 * AART infographic): "Galderma, it's a video here… can we make this a video,
 * or just put a dummy video so we can replace it… it's going to be motion
 * design here." He reached Key Product Experiences only at 17:01 ("bigger and
 * spaced"). Xian, Nov 17: "for Galderma this should be video… what video did
 * you make? not this???" — the Nov 17 dummies went into the KPE slides.
 *
 *   1. Overview `607094ab741e`: `sideVideo` = dummy loop of the AART
 *      infographic itself (slow 2–4 % zoom, 6 s, no audio, same 0.749 ratio,
 *      `ZZ-dummy-galderma-overview-aart-motion.mp4`) + `sideVideoFill: true`
 *      (video at the image's size; the image stays as its poster). Sakib's
 *      motion replaces the file in Studio.
 *   2. KPE `027be1d38455`: unset `video` on both slides (the two dummies
 *      nobody asked for) — the Figma screens stay.
 *
 * Dry by default; `-- --apply` uploads the MP4 (sha1 reuse), backs up and
 * patches published (+ draft if any) under ifRevisionId.
 *
 *   npx sanity exec scripts/patch-galderma-overview-video-nov17.ts --with-user-token [-- --apply]
 */
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import { APPLY, BACKUPS, type Doc, client, fetchDocs } from "./lib/structure-nov11";

const DOC_ID = "cs-galderma";
const OVERVIEW_KEY = "607094ab741e";
const KPE_KEY = "027be1d38455";
const DUMMY = join(process.cwd(), "..", "exports", "figma-2026-11-17", "galderma", "ZZ-dummy-galderma-overview-aart-motion.mp4");

type Carousel = { _key: string; slides?: { _key: string; video?: { asset?: { _ref?: string } } }[] };

async function uploadVideo(absPath: string) {
  const sha1 = createHash("sha1").update(readFileSync(absPath)).digest("hex");
  let id = await client.fetch<string | null>(`*[_type == "sanity.fileAsset" && sha1hash == $sha1][0]._id`, { sha1 });
  if (id) console.log(`  = ${basename(absPath)} → ${id} (already in Sanity)`);
  else {
    const asset = await client.assets.upload("file", createReadStream(absPath), { filename: basename(absPath), contentType: "video/mp4" });
    id = asset._id;
    console.log(`  ↑ ${basename(absPath)} → ${id}`);
  }
  return { _type: "file", asset: { _type: "reference", _ref: id } };
}

async function main() {
  console.log(`patch-galderma-overview-video-nov17 (${APPLY ? "APPLY" : "dry"})`);
  if (!existsSync(DUMMY)) throw new Error(`missing ${DUMMY}`);
  const plans: { doc: Doc; sets: Record<string, unknown>; unsets: string[] }[] = [];
  for (const doc of await fetchDocs(DOC_ID)) {
    const ov = doc.sections.find((s) => s._key === OVERVIEW_KEY);
    const kpe = doc.sections.find((s) => s._key === KPE_KEY);
    if (!ov || ov._type !== "overviewSection") throw new Error(`${doc._id}: overview ${OVERVIEW_KEY} not found`);
    if (!kpe || kpe._type !== "desktopMotionShowcase") throw new Error(`${doc._id}: KPE ${KPE_KEY} not found`);
    const carousels = (kpe.carousels as Carousel[] | undefined) ?? [];
    const ovp = `sections[_key=="${OVERVIEW_KEY}"]`;
    const unsets: string[] = [];
    for (const c of carousels)
      for (const sl of c.slides ?? [])
        if (sl.video) unsets.push(`sections[_key=="${KPE_KEY}"].carousels[_key=="${c._key}"].slides[_key=="${sl._key}"].video`);
    console.log(`\n${doc._id} (rev ${doc._rev})`);
    console.log(`  overview: sideVideo=${(ov.sideVideo as { asset?: { _ref?: string } } | undefined)?.asset?._ref ?? "(none)"} sideVideoFill=${String(ov.sideVideoFill ?? "(unset)")}`);
    console.log(`  → sideVideo = ${basename(DUMMY)}, sideVideoFill = true (image stays as poster)`);
    console.log(`  KPE: ${unsets.length} slide video(s) to remove`);
    const sets: Record<string, unknown> = { [`${ovp}.sideVideoFill`]: true };
    if (APPLY) sets[`${ovp}.sideVideo`] = await uploadVideo(DUMMY);
    plans.push({ doc, sets, unsets });
  }
  if (!APPLY) {
    console.log(`\ndry run — nothing uploaded or written (re-run with -- --apply)`);
    return;
  }
  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `galderma-overview-video-nov17-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify(plans.map((p) => p.doc), null, 1));
  console.log(`\nbackup → ${file}`);
  for (const { doc, sets, unsets } of plans) {
    const res = await client.patch(doc._id).ifRevisionId(doc._rev).set(sets).unset(unsets).commit<Doc>();
    console.log(`✓ ${doc._id}: overview dummy video + fill, ${unsets.length} KPE video(s) removed (rev ${res._rev})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
