/**
 * Work page: a poster for every card that has a Card motion but no Card
 * thumbnail, so the card isn't blank while its video loads (Nov 23 call
 * 21:04–23:39, item 11 in docs/meetings/2026-11-23-actions.md; Xian's plan,
 * Nov 24: the poster is the video's own first frame).
 *
 * WorkBody's card `<video>` already uses `poster={cardThumbnail}`; this fills
 * the existing "Card thumbnail" field (no new field, no code). The videos are
 * Sakib's and are not touched: the frames were taken from the live CDN files
 * with ffmpeg (frame 0, BT.709 → sRGB, JPEG q2 4:4:4) and sit in
 * ../exports/work-card-posters-2026-11-24/:
 *   crop-4x5/   (default) the largest centred 4:5 crop of frame 0 = exactly
 *               what the card shows today (the card box is 4:5 while the field
 *               is empty, the video is `object-fit: cover`). Layout unchanged.
 *   full-frame/ (`--full-frame`) the whole frame. WorkBody sizes the box from
 *               the thumbnail's width × height, so these cards would take the
 *               video's own ratio (1080×1204 … 1080×1358) instead of 4:5 — like
 *               Coral / Experian / Diamond, whose thumbnails match their videos.
 *
 * Safety: each study is pinned to the card-motion asset the frame came from
 * (skipped if Sakib has replaced the video since — re-extract first). The field
 * is set only while it is still empty, so it never overwrites a thumbnail of
 * Sakib's; a study whose draft holds its own thumbnail is skipped. The draft,
 * if any and still empty, gets the same poster so a later Publish keeps it.
 * The image field has no alt subfield (the card uses the study name).
 *
 * Dry by default: reads only, no upload (it does look the files up by sha1 to
 * say whether an apply would upload or reuse). `-- --apply` uploads each file
 * once (an asset with the same sha1 is reused, so a re-run uploads nothing),
 * re-reads the documents right before writing and refuses if anything moved,
 * writes a full-document backup to ../exports/sanity-backups/ and patches
 * under ifRevisionId. Re-run = "already has a thumbnail". Undo: Studio → the
 * study → Card → Card thumbnail → Remove (or unset from the backup). Sakib's
 * own thumbnail, uploaded later, simply replaces the poster.
 *
 *   npx sanity exec scripts/patch-work-card-posters-nov24.ts --with-user-token [-- --apply] [-- --full-frame]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client as cliClient, image, uploadedCount, type ImageRef } from "./lib/structure-nov11";

const client = cliClient.withConfig({ perspective: "raw" });

const FULL = process.argv.includes("--full-frame");
const VARIANT = FULL ? "full-frame" : "crop-4x5";
const DIR = join(process.cwd(), "..", "exports", "work-card-posters-2026-11-24", VARIANT);

/** Motion-only cards on Nov 24 (live query) + the card-motion asset each frame came from. */
const CARDS: { id: string; slug: string; motion: string }[] = [
  { id: "cs-financial-data-exchange", slug: "financial-data-exchange", motion: "file-74e0f9ea06da4add0fb4083736812d9e31012e53-mp4" },
  { id: "cs-remote-assistant-object-detection", slug: "the-ar-handbook", motion: "file-50f3b708295e59935276bd6ad22e1143fe9d1938-mp4" },
  { id: "cs-oc-digital-resource-navigator", slug: "oc-digital-resource-navigator", motion: "file-7c4958f12b2fa97f349b85bde7b44cbca1181e86-mp4" },
  { id: "cs-oc-links", slug: "oc-links", motion: "file-a48d40edc083a279f646c6289c2e869288c21b48-mp4" },
  { id: "cs-acme-lending", slug: "acme-lending", motion: "file-04946b65cea4f7fabec08c0c0aeaff00f1008721-mp4" },
  { id: "cs-galderma", slug: "galderma", motion: "file-c53758a065ede5e99094fe7e0040d4b89085e122-mp4" },
  { id: "cs-vuforia-chalk", slug: "vuforia-chalk", motion: "file-c534db5fe3db4a0959387d1732058a2d8b773cd5-mp4" },
];

type Doc = {
  _id: string;
  _rev: string;
  title?: string;
  cardThumbnail?: { asset?: { _ref?: string } } | null;
  cardThumbnailMotion?: { asset?: { _ref?: string } } | null;
} & Record<string, unknown>;
type Change = { doc: Doc; slug: string; file: string };

/** Width × height from a baseline/progressive JPEG's SOF marker. */
function jpegSize(buf: Buffer): { w: number; h: number } {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) throw new Error("not a JPEG");
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error("no SOF marker");
}

const ref = (v: { asset?: { _ref?: string } } | null | undefined) => v?.asset?._ref ?? null;

async function plan(log: boolean): Promise<Change[]> {
  const say = (s: string) => log && console.log(s);
  const ids = CARDS.flatMap((c) => [c.id, `drafts.${c.id}`]);
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]`, { ids });
  const changes: Change[] = [];
  for (const card of CARDS) {
    const pub = docs.find((d) => d._id === card.id);
    const draft = docs.find((d) => d._id === `drafts.${card.id}`);
    const file = join(DIR, `${card.slug}.jpg`);
    say(`\n${card.slug} — "${pub?.title ?? draft?.title ?? "?"}"`);
    if (!pub) {
      say(`  ✗ skip: ${card.id} not published`);
      continue;
    }
    if (draft && ref(draft.cardThumbnail)) {
      say(`  ✗ skip: the draft has its own Card thumbnail (${ref(draft.cardThumbnail)}) — ask Sakib / Xian`);
      continue;
    }
    if (!existsSync(file)) throw new Error(`missing poster file: ${file}`);
    const { w, h } = jpegSize(readFileSync(file));
    let any = false;
    for (const doc of [pub, draft]) {
      if (!doc) continue;
      const thumb = ref(doc.cardThumbnail);
      const motion = ref(doc.cardThumbnailMotion);
      const tag = doc._id === pub._id ? "published" : "draft    ";
      if (thumb) {
        say(`  ${tag} = already has a Card thumbnail (${thumb}) — left alone`);
        continue;
      }
      if (motion !== card.motion) {
        say(`  ${tag} ✗ skip: Card motion is now ${motion ?? "empty"}, the frame is from ${card.motion} — re-extract`);
        continue;
      }
      say(`  ${tag} (rev ${doc._rev}) Card thumbnail: empty → ${VARIANT}/${card.slug}.jpg (${w}×${h}, ${(w / h).toFixed(3)}; 4:5 = 0.800)`);
      changes.push({ doc, slug: card.slug, file });
      any = true;
    }
    if (!draft) say(`  draft      none`);
    if (!any) say(`  nothing to do`);
  }
  return changes;
}

async function main() {
  console.log(`patch-work-card-posters-nov24 (${APPLY ? "APPLY" : "dry"}, ${VARIANT})`);
  console.log(`files: ${DIR}`);
  const first = await plan(true);
  const files = [...new Set(first.map((c) => c.file))];
  console.log(`\n${first.length} document(s) to patch, ${files.length} poster file(s)`);
  if (!first.length) return console.log("nothing to do");

  const shas = new Map<string, string>();
  for (const f of files) {
    const sha1 = createHash("sha1").update(readFileSync(f)).digest("hex");
    if ([...shas.values()].includes(sha1)) throw new Error(`refusing: ${f} is identical to another poster`);
    shas.set(f, sha1);
  }
  if (!APPLY) {
    for (const f of files) {
      const existing = await client.fetch<string | null>(
        `*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`,
        { sha1: shas.get(f) },
      );
      console.log(`  ${existing ? `= reuse ${existing}` : "↑ would upload"}  ${f.split(/[\\/]/).pop()} (sha1 ${shas.get(f)!.slice(0, 12)})`);
    }
    return console.log(`dry run — nothing uploaded or written (re-run with -- --apply)`);
  }

  // Upload (or reuse by sha1) before the re-read, so the re-read sits right before the writes.
  const refs = new Map<string, ImageRef>();
  for (const f of files) refs.set(f, await image(f));

  // Re-read right before writing; refuse if anything moved since the plan above.
  const changes = await plan(false);
  const sig = (cs: Change[]) => JSON.stringify(cs.map((c) => [c.doc._id, c.doc._rev, c.file]));
  if (sig(changes) !== sig(first)) throw new Error("refusing: the documents changed while planning — run again");

  mkdirSync(BACKUPS, { recursive: true });
  const backup = join(BACKUPS, `work-card-posters-nov24-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(backup, JSON.stringify(changes.map((c) => c.doc), null, 1));
  console.log(`\nbackup → ${backup}`);

  for (const c of changes) {
    const img = refs.get(c.file)!;
    const res = await client
      .patch(c.doc._id)
      .ifRevisionId(c.doc._rev)
      .set({ cardThumbnail: img })
      .commit<Doc>();
    console.log(`✓ ${c.doc._id} (rev ${res._rev}): Card thumbnail empty → ${ref(res.cardThumbnail)}`);
  }
  console.log(`uploaded ${uploadedCount()} new image asset(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
