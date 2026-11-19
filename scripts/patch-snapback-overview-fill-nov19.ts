/**
 * Snapback (Luku) Overview = Forever a Surfer's look: the whole right half is
 * a coloured panel with the footage in a white card (Fas, Nov 18 evening: "the
 * snapback campaign video section and background needs to be made consistent
 * with the Forever Surfer video and background").
 *
 * Sakib's export `Section (1).mp4` (1080×1312) already IS that panel: Luku
 * pink plate #e6c8ca with the montage in a white card — its shape matches the
 * Overview's right half (≈713×819 at 1440). The site showed it at phone-video
 * width (portrait video → 19.86vw), so it read as a small pink box. Two Studio
 * fields fix it, no code and no change to his video:
 *  - "Video fills the panel like the side image" (sideVideoFill) on → the
 *    video fills the right half (contain), card ≈525px wide at 1440 (FaS 555);
 *  - side background = the plate's pink #e6c8ca (was #e8e4dc = page), so the
 *    thin strips beside the video blend in.
 *
 * Dry by default; `-- --apply` backs up the Overview section and patches under
 * ifRevisionId. Refuses if a draft exists or the video isn't Sakib's file.
 *
 *   npx sanity exec scripts/patch-snapback-overview-fill-nov19.ts --with-user-token [-- --apply]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { APPLY, BACKUPS, client } from "./lib/structure-nov11";

const ID = "cs-snapback-lifestyle";
const KEY = "07dc0d0ed2d2";
const VIDEO = "file-c006d2d116a55d1680273e00738cc5afd07cb3e3-mp4";
const PINK = { _type: "color", alpha: 1, hex: "#e6c8ca" };

async function main() {
  console.log(`patch-snapback-overview-fill-nov19 (${APPLY ? "APPLY" : "dry"})`);
  const doc = await client.fetch<{ _rev: string; ov?: Record<string, any> } | null>(
    `*[_id == $id][0]{ _rev, "ov": sections[_key == $key][0] }`,
    { id: ID, key: KEY },
  );
  if (!doc?.ov) throw new Error("Snapback Overview section not found");
  const draft = await client.fetch<string | null>(`*[_id == "drafts." + $id][0]._id`, { id: ID });
  if (draft) throw new Error(`a draft exists (${draft}) — publish or discard it in Studio first`);
  if (doc.ov.sideVideo?.asset?._ref !== VIDEO) throw new Error(`side video is ${doc.ov.sideVideo?.asset?._ref}, expected Sakib's ${VIDEO}`);

  console.log(`${ID} (rev ${doc._rev}) Overview ${KEY}`);
  console.log(`  sideVideoFill: ${doc.ov.sideVideoFill ?? null} → true`);
  console.log(`  sideImageBackgroundColor: ${doc.ov.sideImageBackgroundColor?.hex ?? null} → ${PINK.hex}`);
  console.log(`  sideVideoCard: ${doc.ov.sideVideoCard ?? null} (unchanged — the card is in the video)`);

  if (!APPLY) return console.log(`dry run — nothing written (re-run with -- --apply)`);

  mkdirSync(BACKUPS, { recursive: true });
  const file = join(BACKUPS, `snapback-overview-fill-nov19-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(file, JSON.stringify({ _id: ID, _rev: doc._rev, overview: doc.ov }, null, 1));
  console.log(`backup → ${file}`);
  const res = await client
    .patch(ID)
    .ifRevisionId(doc._rev)
    .set({
      [`sections[_key=="${KEY}"].sideVideoFill`]: true,
      [`sections[_key=="${KEY}"].sideImageBackgroundColor`]: PINK,
    })
    .commit();
  console.log(`✓ ${ID}: Overview video fills the pink panel (rev ${res._rev})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
