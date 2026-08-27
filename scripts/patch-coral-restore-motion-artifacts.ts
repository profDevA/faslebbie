/**
 * Restore Coral Health motionShowcase rows + Research Artifacts images when
 * Studio/schema edits wiped nested arrays (rows/items lost _key + assets).
 * Preserves section _key, appearance, and custom captions where possible.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-restore-motion-artifacts.ts --with-user-token -- --dry
 *   sanity exec scripts/patch-coral-restore-motion-artifacts.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const DOC_ID = "cs-coral-health";
const CH = "/work/coral-health";
const M = `${CH}/motion`;
const DRY = process.argv.includes("--dry");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const ARTIFACTS = [
  ["THE PROBLEM", `${CH}/artifacts/problem.png`],
  ["PROBLEM & SOLUTION", `${CH}/artifacts/problem-solution.png`],
  ["STRUCTURAL DISPARITIES", `${CH}/artifacts/structural-disparities.png`],
  ["VALUE PROPOSITION CANVAS", `${CH}/artifacts/value-proposition.png`],
  ["THE SOLUTION", `${CH}/artifacts/solution.png`],
  ["THEORY OF CHANGE", `${CH}/artifacts/theory-of-change.png`],
] as const;

const MOBILE_VIDEOS = [
  `${M}/Flow-1 Mobile.mp4`,
  `${M}/Flow-2 Mobile.mp4`,
  `${M}/Flow-3 Mobile.mp4`,
];

const TABLET_VIDEOS = [`${M}/Coral-Tablet-Flow-1.mp4`, `${M}/Coral-Tablet-Flow-2.mp4`];

const MOBILE_CAPTION =
  "Smart Matching replaces a five-to-seven-source search with one guided session, pairing users with culturally aligned providers in minutes, not weeks.";

const TABLET_CAPTION =
  "At-home test kits and in-home phlebotomy bring screening into users' homes, removing the transportation and childcare barriers that used to end it.";

const uploadCache = new Map<string, string | null>();

async function uploadFile(p: string): Promise<string | null> {
  if (uploadCache.has(p)) return uploadCache.get(p)!;
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${p}`);
    uploadCache.set(p, null);
    return null;
  }
  const asset = await client.assets.upload("file", createReadStream(abs), {
    filename: basename(abs),
  });
  uploadCache.set(p, asset._id);
  return asset._id;
}

async function uploadImage(p: string) {
  if (uploadCache.has(p)) {
    const id = uploadCache.get(p);
    return id ? { _type: "image", asset: { _type: "reference", _ref: id } } : undefined;
  }
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset: ${p}`);
    uploadCache.set(p, null);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  uploadCache.set(p, asset._id);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function mediaVideo(p: string) {
  const id = await uploadFile(p);
  if (!id) return null;
  return {
    _type: "mediaItem",
    _key: key(),
    mediaType: "video",
    videoFile: { _type: "file", asset: { _type: "reference", _ref: id } },
  };
}

async function buildMotionRows() {
  const mobileItems = [];
  for (const p of MOBILE_VIDEOS) {
    const item = await mediaVideo(p);
    if (item) mobileItems.push(item);
  }
  const tabletItems = [];
  for (const p of TABLET_VIDEOS) {
    const item = await mediaVideo(p);
    if (item) tabletItems.push(item);
  }
  return [
    {
      _type: "motionRow",
      _key: key(),
      device: "mobile",
      caption: MOBILE_CAPTION,
      items: mobileItems,
    },
    {
      _type: "motionRow",
      _key: key(),
      device: "tablet",
      caption: TABLET_CAPTION,
      items: tabletItems,
    },
  ];
}

async function buildArtifactItems() {
  const items = [];
  for (const [caption, p] of ARTIFACTS) {
    const img = await uploadImage(p);
    if (img) items.push({ _type: "showcaseItem", _key: key(), image: img, caption });
  }
  return items;
}

type Section = { _key: string; _type: string; sectionTitle?: string; rows?: unknown; items?: unknown };

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_id == $id][0]{ _id, sections[]{ _key, _type, sectionTitle, rows, items } }`,
    { id: DOC_ID },
  );

  const motionIdx = doc.sections.findIndex((s) => s._type === "motionShowcase");
  const artIdx = doc.sections.findIndex((s) => s._type === "showcaseGallery");
  if (motionIdx < 0 && artIdx < 0) {
    console.error("No motionShowcase or showcaseGallery on coral-health.");
    process.exit(1);
  }

  const patch = client.patch(doc._id);
  let changes = 0;

  if (motionIdx >= 0) {
    const rows = await buildMotionRows();
    console.log(`motionShowcase[${motionIdx}]: restore ${rows.length} rows (${rows[0]?.items?.length ?? 0}+${rows[1]?.items?.length ?? 0} videos)`);
    if (!DRY) {
      patch.set({ [`sections[${motionIdx}].rows`]: rows });
      patch.set({ [`sections[${motionIdx}].sectionTitle`]: "Key Product Experiences" });
      for (const orphan of ["body", "caption", "ctaLabel", "ctaUrl", "videoFile", "videoUrl", "items"]) {
        patch.unset([`sections[${motionIdx}].${orphan}`]);
      }
    }
    changes++;
  }

  if (artIdx >= 0) {
    const items = await buildArtifactItems();
    console.log(`showcaseGallery[${artIdx}]: restore ${items.length} artifact slide(s)`);
    if (!DRY) {
      patch.set({ [`sections[${artIdx}].items`]: items });
      patch.set({ [`sections[${artIdx}].expandable`]: true });
    }
    changes++;
  }

  if (!changes) {
    console.log("Nothing to restore.");
    return;
  }
  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }
  await patch.commit();
  console.log("✓ Coral motion + artifacts restored");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
