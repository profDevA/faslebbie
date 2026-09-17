/**
 * The AR Handbook §04 View More popup — 3 device tabs + Load More grid (live WP / Coral pattern).
 *
 * Downloads flow screenshots from fasandsabrina.com and uploads to Sanity.
 * Band previewScreens unchanged — patch-ar-handbook-core-experience.ts.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-core-experience-popup-tabs.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-core-experience-popup-tabs.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-core-experience-popup-tabs.ts --with-user-token -- --appearance-only
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "the-ar-handbook";
const CACHE = join(
  process.cwd(),
  "public/work/the-ar-handbook/core-flow/popup-tabs",
);
const WP = "http://fasandsabrina.com/wp-content/uploads/2024/12";

/** Live site popup section rgb(101,129,129) — slightly lighter than band #4c6060. */
const POPUP_BG = "#658181";
const POPUP_TILE_BG = "#4d585a";

const INTRO =
  "Three distinct flows answer different questions: Classify (What is this single part?), Detect (Where are all parts?), Label & Train (How does the system improve?). Together they form a learning loop where better data creates trust, and better trust creates adoption, compounding value over time.";

const TABS = [
  {
    label: "Mobile View",
    files: [
      "1-4-scaled.png",
      "2-3-scaled.png",
      "3-4-scaled.png",
      "4-4-scaled.png",
      "5-4-scaled.png",
      "6-4-scaled.png",
      "7-4-scaled.png",
      "8-3-scaled.png",
      "9-3-scaled.png",
      "10-4-scaled.png",
      "11-3-scaled.png",
      "12-6-scaled.png",
    ],
  },
  {
    label: "Ipad View",
    files: [
      "1-5-scaled.png",
      "2-4-scaled.png",
      "3-5-scaled.png",
      "4-5-scaled.png",
      "5-5-scaled.png",
      "6-5-scaled.png",
      "7-5-scaled.png",
      "8-4-scaled.png",
      "9-4-scaled.png",
      "10-5-scaled.png",
      "11-4-scaled.png",
      "12-7-scaled.png",
      "13-12-scaled.png",
      "14-8-scaled.png",
    ],
  },
  {
    label: "Realwear",
    files: [
      "1-6-scaled.png",
      "2-5-scaled.png",
      "3-6-scaled.png",
      "4-6-scaled.png",
      "5-6-scaled.png",
      "6-6-scaled.png",
      "7-6-scaled.png",
      "8-5-scaled.png",
      "9-5-scaled.png",
      "10-6-scaled.png",
      "11-5-scaled.png",
      "12-8-scaled.png",
      "13-13-scaled.png",
      "14-9-scaled.png",
      "15-3-scaled.png",
      "16-4-scaled.png",
      "17-4-scaled.png",
      "18-3-scaled.png",
      "19-2-scaled.png",
      "20-2-scaled.png",
      "21-3-scaled.png",
      "22-3-scaled.png",
      "23-4-scaled.png",
      "24-3-scaled.png",
    ],
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function download(url: string, dest: string, tries = 3) {
  if (existsSync(dest)) return;
  mkdirSync(join(dest, ".."), { recursive: true });
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
      await pipeline(res.body!, createWriteStream(dest));
      return;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function uploadImage(path: string) {
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: path.split(/[/\\]/).pop(),
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function appearancePatch(idx: number) {
  return {
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor("#ffffff"),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(POPUP_TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _key: string; _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _key, _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section");

  if (APPEARANCE_ONLY) {
    const patch = appearancePatch(idx);
    await client.patch(docId).set(patch).commit();
    console.log(`✓ ${SLUG}: popup appearance only`);
    const draftId = `drafts.${docId}`;
    const draft = await client.fetch<{ sections?: unknown[] } | null>(
      `*[_id == $id][0]{ sections }`,
      { id: draftId },
    );
    if (draft?.sections) {
      await client.patch(draftId).set(patch).commit();
      console.log(`✓ synced ${draftId}`);
    }
    return;
  }

  mkdirSync(CACHE, { recursive: true });

  const popupTabs: {
    _key: string;
    _type: "deviceTab";
    label: string;
    items: {
      _key: string;
      _type: "galleryItem";
      image: Awaited<ReturnType<typeof uploadImage>>;
    }[];
  }[] = [];

  for (const tab of TABS) {
    const items: (typeof popupTabs)[number]["items"] = [];
    for (const file of tab.files) {
      const url = `${WP}/${file}`;
      const local = join(
        CACHE,
        tab.label.replace(/\s+/g, "-").toLowerCase(),
        file,
      );
      console.log(`↓ ${tab.label} / ${file}`);
      await download(url, local);
      if (DRY) {
        items.push({
          _key: key(),
          _type: "galleryItem",
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: "dry-run" },
          },
        });
        continue;
      }
      const image = await uploadImage(local);
      items.push({ _key: key(), _type: "galleryItem", image });
    }
    popupTabs.push({ _key: key(), _type: "deviceTab", label: tab.label, items });
  }

  const popupBody = [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: INTRO, marks: [] }],
    },
  ];

  const patch = {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flows",
    [`sections[${idx}].popupBody`]: popupBody,
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: 6,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    ...appearancePatch(idx),
  };

  if (DRY) {
    const counts = popupTabs.map((t) => `${t.label}=${t.items.length}`).join(", ");
    console.log(`DRY ✓ ${SLUG}: popupTabs (${counts})`);
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([`sections[${idx}].popupScreens`])
    .commit();
  console.log(
    `✓ ${SLUG}: popupTabs=${popupTabs.length} (${popupTabs.map((t) => t.items.length).join("+")} images)`,
  );

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections) {
    await client
      .patch(draftId)
      .set(patch)
      .unset([`sections[${idx}].popupScreens`])
      .commit();
    console.log(`✓ synced ${draftId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
