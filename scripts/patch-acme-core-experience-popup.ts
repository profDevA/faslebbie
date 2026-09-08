/**
 * Acme Lending — Core Experience View More popup (live WP use-case tabs).
 *
 * Source: fasandsabrina.com/case-studies/acme-lending/ § use-case grid
 * (scraped HTML: docs/reference/faslebbie/pages/acme-lending.html).
 *
 * Three popupTabs → DeviceGallery tab bar (Use Case 1 / 2 / 3). Persona +
 * scenario copy is baked into the first tile image per tab (1480, 1483, 13-7).
 * Band previewScreens unchanged — patch-acme-core-experience.ts.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-core-experience-popup.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-core-experience-popup.ts --with-user-token
 */
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COPY_ONLY = process.argv.includes("--copy-only");
const SLUG = "acme-lending";
const CACHE = join(process.cwd(), "public/work/acme-lending/use-cases");
const WP = "https://fasandsabrina.com/wp-content/uploads/2024/12";

/** Figma / live — light blue popup interior. */
const POPUP_BG = "#cce0f0";
const TILE_BG = "#202a33";

/** Live site shows 6 tiles before Load More (WP grid_view_block JS). */
const ITEMS_BEFORE_LOAD_MORE = 6;

/** Figma 3928:22978 / 3928:22982 — popup intro + tab labels. */
const POPUP_TITLE = "Design Interventions";
const POPUP_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

/** Grid order matches live WP mobile-view / ipad-view / desktop-view blocks. */
const USE_CASE_TABS = [
  {
    label: "Use Case 1: One Account, One Bank",
    files: [
      "1480.png",
      "1481.png",
      "1482.png",
      "12-2.png",
      "EB_AI_slider_3.Jpg-5.png",
      "13-6.png",
      "EB_AI_slider_3.Jpg-1-1.png",
      "EB_AI_slider_3.Jpg-2-1.png",
      "EB_AI_slider_3.Jpg-3-1.png",
      "EB_AI_slider_3.Jpg-4-1.png",
      "EB_AI_slider_3.Jpg-5-1.png",
      "EB_AI_slider_3.Jpg-6.png",
      "EB_AI_slider_3.Jpg-7.png",
      "EB_AI_slider_3.Jpg-8.png",
    ],
  },
  {
    label: "Use Case 2: Two Accounts, One Bank",
    files: [
      "1483.png",
      "1484.png",
      "1485.png",
      "1486.png",
      "EB_AI_slider_3.Jpg-9.png",
      "1487.png",
      "EB_AI_slider_3.Jpg-1-2.png",
      "EB_AI_slider_3.Jpg-2-2.png",
      "EB_AI_slider_3.Jpg-3-2.png",
      "EB_AI_slider_3.Jpg-4-2.png",
      "EB_AI_slider_3.Jpg-5-2.png",
      "EB_AI_slider_3.Jpg-6-1.png",
      "EB_AI_slider_3.Jpg-7-1.png",
    ],
  },
  {
    label: "Use Case 3: Two Accounts, Two Banks",
    files: [
      "13-7.png",
      "12-3.png",
      "13-1-1.png",
      "EB_AI_slider_3.Jpg-11.png",
      "12-1-1.png",
      "EB_AI_slider_3.Jpg-10.png",
      "13-2-1.png",
      "EB_AI_slider_3.Jpg-2-3.png",
      "EB_AI_slider_3.Jpg-3-3.png",
      "EB_AI_slider_3.Jpg-4-3.png",
      "EB_AI_slider_3.Jpg-5-3.png",
    ],
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function popupBodyBlocks() {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: POPUP_BODY, marks: [] }],
    },
  ];
}

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

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

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function patchCopyDoc(docId: string, idx: number) {
  type Tab = {
    _key: string;
    _type: "deviceTab";
    label: string;
    items?: unknown[];
  };
  const doc = await client.fetch<{ sections: { popupTabs?: Tab[] }[] }>(
    `*[_id == $id][0]{ sections[]{ popupTabs[]{ _key, _type, label, items } } }`,
    { id: docId },
  );
  const tabs = doc.sections[idx]?.popupTabs ?? [];
  if (tabs.length < USE_CASE_TABS.length) {
    throw new Error(`expected ${USE_CASE_TABS.length} popupTabs, found ${tabs.length}`);
  }

  const popupTabs = tabs.map((tab, i) => ({
    ...tab,
    label: USE_CASE_TABS[i]?.label ?? tab.label,
  }));

  const patch = {
    [`sections[${idx}].popupTitle`]: POPUP_TITLE,
    [`sections[${idx}].popupBody`]: popupBodyBlocks(),
    [`sections[${idx}].popupTabs`]: popupTabs,
  };

  if (DRY) {
    console.log(`dry-run ${docId}: copy-only title + ${popupTabs.length} tab labels`);
    return;
  }

  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: popup copy (Figma 3928:22978)`);
}

async function patchDoc(docId: string, idx: number) {
  if (COPY_ONLY) {
    await patchCopyDoc(docId, idx);
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
      image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
    }[];
  }[] = [];

  for (const tab of USE_CASE_TABS) {
    const items: (typeof popupTabs)[number]["items"] = [];
    for (const file of tab.files) {
      const url = `${WP}/${file}`;
      const local = join(CACHE, tab.label.replace(/\s+/g, "-").toLowerCase(), file);
      console.log(`${DRY ? "○" : "↓"} ${tab.label} / ${file}`);
      if (!DRY) {
        await download(url, local);
        items.push({
          _key: key(),
          _type: "galleryItem",
          image: await uploadImage(local),
        });
      } else {
        items.push({
          _key: key(),
          _type: "galleryItem",
          image: { _type: "image", asset: { _type: "reference", _ref: "dry-run" } },
        });
      }
    }
    popupTabs.push({ _key: key(), _type: "deviceTab", label: tab.label, items });
    console.log(`  ${tab.label}: ${items.length} tile(s)`);
  }

  const patch = {
    [`sections[${idx}].popupTitle`]: POPUP_TITLE,
    [`sections[${idx}].popupBody`]: popupBodyBlocks(),
    [`sections[${idx}].popupTabs`]: popupTabs,
    [`sections[${idx}].popupItemsBeforeViewMore`]: ITEMS_BEFORE_LOAD_MORE,
    [`sections[${idx}].popupLoadMoreLabel`]: "Load More",
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].popupAppearance.backgroundColor`]: sanityColor(POPUP_BG),
    [`sections[${idx}].popupAppearance.textColor`]: sanityColor("#000000"),
    [`sections[${idx}].popupAppearance.contentAlignment`]: "left",
    [`sections[${idx}].popupAppearance.tileBackgroundColor`]: sanityColor(TILE_BG),
    [`sections[${idx}].popupAppearance.contentGap`]: 43,
    [`sections[${idx}].popupAppearance.contentGapInner`]: 87,
  };

  if (DRY) {
    console.log(
      `dry-run ${docId}: popupTabs=${popupTabs.length} (${popupTabs.map((t) => t.items.length).join("+")} tiles)`,
    );
    return;
  }

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${docId}: Acme CE popup use cases (${popupTabs.length} tabs)`);
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section");

  await patchDoc(docId, idx);

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections && !DRY) {
    await patchDoc(draftId, idx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
