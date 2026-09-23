/**
 * Circle §04 Core Experience Flow (Figma desktop `4171:48253` / mobile `4171:37257`).
 *
 * Five phone tiles, mobileRow (desktop strip + mobile 2-col). Band `#2f2f2f`.
 * Captions from the desktop frame. Mobile captions are leftover Experian Boost
 * (“Credit Starting Point”, “Connect Account”, …) — ignored.
 *
 * View More popup is a separate frame (`4409:26000`) — patch with
 * `patch-circle-core-experience-popup.ts`. This script does not touch popup
 * tabs, so a re-run will not put the band phones back into View More.
 *
 * PNG @4×: public/work/circle/core-flow/01–05-*.png
 *   01 — 4171:48261 Preference Signals
 *   02 — 4171:48301 Taste Profile
 *   03 — 4171:48375 Trusted Discovery
 *   04 — 4171:48527 Live AR
 *   05 — 4171:48612 Trusted Insights
 *
 * Inserts `coreExperience` after Problem Context when the Memory Tubes spine
 * has none. Does not touch hero, overview, or section-height behavior.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-core-experience.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "circle";
const PUB_ID = "cs-circle";
const FLOW_DIR = join(process.cwd(), "public/work/circle/core-flow");

const BAND_BG = "#2f2f2f";
const TEXT = "#ffffff";

const SCREENS = [
  {
    file: "01-preference-signals.png",
    figma: "4171:48261",
    label: "Preference Signals:",
    description: "Calibrate recommendations around what you truly enjoy.",
  },
  {
    file: "02-taste-profile.png",
    figma: "4171:48301",
    label: "Taste Profile:",
    description: "Personalize recommendations through your unique preferences.",
  },
  {
    file: "03-trusted-discovery.png",
    figma: "4171:48375",
    label: "Trusted Discovery:",
    description: "Explore nearby places recommended by your circle.",
  },
  {
    file: "04-live-ar.png",
    figma: "4171:48527",
    label: "Live AR:",
    description: "Reveal trusted recommendations within your surroundings.",
  },
  {
    file: "05-trusted-insights.png",
    figma: "4171:48612",
    label: "Trusted Insights:",
    description: "Make confident decisions backed by your community.",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = { _key: string; _type: string };

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

async function buildScreens() {
  const screens = [];
  for (const row of SCREENS) {
    const abs = join(FLOW_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
    const meta = await sharp(abs).metadata();
    const imageWidth = meta.width ?? 0;
    const imageHeight = meta.height ?? 0;
    console.log(
      `${DRY ? "○" : "↑"} ${row.file} (${row.figma}) ${imageWidth}x${imageHeight}`,
    );
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    screens.push({
      _key: key(),
      _type: "coreExperienceScreen" as const,
      image,
      label: row.label,
      description: row.description,
      imageWidth,
      imageHeight,
    });
  }
  return screens;
}

function fields(idx: number, previewScreens: Awaited<ReturnType<typeof buildScreens>>) {
  return {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].layoutVariant`]: "mobileRow",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].previewScreens`]: previewScreens,
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
    [`sections[${idx}].previewAppearance.tileBackgroundColor`]: sanityColor(BAND_BG),
  };
}

async function ensureSection(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return -1;
  const sections = (doc.sections ?? []) as Section[];
  const existing = sections.findIndex((s) => s._type === "coreExperience");
  if (existing >= 0) return existing;

  const problem = sections.find((s) => s._type === "problemContextSection");
  if (!problem) throw new Error(`${docId}: no problemContextSection to insert after`);

  console.log(`→ insert coreExperience after problemContext on ${docId}`);
  if (DRY) return sections.findIndex((s) => s._key === problem._key) + 1;

  await client
    .patch(docId)
    .insert("after", `sections[_key=="${problem._key}"]`, [
      {
        _key: key(),
        _type: "coreExperience",
        sectionTitle: "Core Experience Flow",
      },
    ])
    .commit();

  const next = await client.getDocument(docId);
  const idx = ((next?.sections ?? []) as Section[]).findIndex(
    (s) => s._type === "coreExperience",
  );
  if (idx < 0) throw new Error(`${docId}: insert did not land`);
  return idx;
}

async function patchDoc(
  docId: string,
  previewScreens: Awaited<ReturnType<typeof buildScreens>>,
) {
  const idx = await ensureSection(docId);
  if (idx < 0) return;
  console.log(`→ patch ${docId} coreExperience[${idx}]`);
  if (DRY) return;
  await client
    .patch(docId)
    .set(fields(idx, previewScreens))
    .unset([
      `sections[${idx}].image`,
      `sections[${idx}].imageMobile`,
      `sections[${idx}].mobilePreviewScreens`,
    ])
    .commit();
}

async function main() {
  console.log(`patch-circle-core-experience (${DRY ? "dry" : "live"})`);
  const previewScreens = await buildScreens();

  const pub = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`,
    { id: PUB_ID },
  );
  if (!pub) throw new Error(`Missing ${PUB_ID}`);

  await patchDoc(pub._id, previewScreens);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    await patchDoc(draftId, previewScreens);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }
  console.log(`✓ Circle CE band (${previewScreens.length} screens, ${BAND_BG})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
