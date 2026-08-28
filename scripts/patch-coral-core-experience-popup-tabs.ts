/**
 * Coral §04 popup — 3 device tabs + Load More grid (Figma 3670:21768 / live WP).
 *
 * Downloads flow screenshots from fasandsabrina.com and uploads to Sanity.
 * Band preview screens are unchanged — patch-coral-core-experience-screens.ts.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-core-experience-popup-tabs.ts --with-user-token
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "coral-health";
const CACHE = join(process.cwd(), "public/work/coral-health/core-flow/popup-tabs");
const WP = "http://fasandsabrina.com/wp-content/uploads/2024/12";

const INTRO =
  "The experience design is built around eight interconnected modules that guide the user from uncertainty to action. These flows were designed to be non-linear, allowing users to enter and exit while always being re-oriented toward their next best health action.";

const TABS = [
  { label: "Mobile View", suffix: "Jpg-2.png" },
  { label: "iPad View", suffix: "Jpg-1-1-scaled.png" },
  { label: "Desktop View", suffix: "Jpg-3-scaled.png" },
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
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
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

  mkdirSync(CACHE, { recursive: true });

  const popupTabs: {
    _key: string;
    _type: "deviceTab";
    label: string;
    items: { _key: string; _type: "galleryItem"; image: Awaited<ReturnType<typeof uploadImage>> }[];
  }[] = [];

  for (const tab of TABS) {
    const items: (typeof popupTabs)[number]["items"] = [];
    for (let n = 1; n <= 9; n++) {
      const file = `CH_DI_slider_${n}.${tab.suffix}`;
      const url = `${WP}/${file}`;
      const local = join(CACHE, tab.label.replace(/\s+/g, "-").toLowerCase(), file);
      console.log(`↓ ${file}`);
      await download(url, local);
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
  };

  await client.patch(docId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
  console.log(`✓ ${SLUG}: popupTabs=${popupTabs.length} (${popupTabs[0].items.length} images each)`);

  const draftId = `drafts.${docId}`;
  const draft = await client.fetch<{ sections?: unknown[] } | null>(
    `*[_id == $id][0]{ sections }`,
    { id: draftId },
  );
  if (draft?.sections) {
    await client.patch(draftId).set(patch).unset([`sections[${idx}].popupScreens`]).commit();
    console.log(`✓ synced ${draftId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
