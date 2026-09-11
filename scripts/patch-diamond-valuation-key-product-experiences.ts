/**
 * Diamond Valuation AI §07 Key Product Experiences (Figma 4001:76397 / 4001:79990).
 *
 * One motionShowcase phoneRow band — three full-frame phones + bottom-right intro.
 * Does not touch desktopMotionShowcase or other sections.
 *
 * PNG source: public/work/diamond-valuation-ai/key-product/01–03-*.png
 *   01 — 4002:86612 Value your diamond
 *   02 — 4002:86681 Join ROOT
 *   03 — 4002:86712 Log in
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-key-product-experiences.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-diamond-valuation-ai";
const ASSET_DIR = join(
  process.cwd(),
  "public/work/diamond-valuation-ai/key-product",
);

/** Figma 4001:76397 band fill — matches CE strip. */
const BAND_BG = "#999999";
/** Figma body on gray */
const TEXT = "#171717";

const collabDva = collab["diamond-valuation-ai" as keyof typeof collab] as {
  desktopMotion?: { body?: string };
};

const INTRO =
  collabDva?.desktopMotion?.body ??
  "A desktop walkthrough would follow one rough stone end to end: a miner scans six angles, watches AI analysis resolve into a value, then submits verified provenance to ROOT.";

const PHONES = [
  {
    file: "01-value-your-diamond.png",
    figma: "4002:86612",
    caption: "Value your diamond",
  },
  {
    file: "02-join-root.png",
    figma: "4002:86681",
    caption: "Join ROOT",
  },
  {
    file: "03-log-in.png",
    figma: "4002:86712",
    caption: "Log in",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function pt(text: string) {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    },
  ];
}

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

async function buildItems() {
  const items = [];
  for (const phone of PHONES) {
    const abs = join(ASSET_DIR, phone.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
    console.log(`${DRY ? "○" : "↑"} ${phone.file} (${phone.figma})`);
    items.push({
      _type: "mediaItem" as const,
      _key: key(),
      mediaType: "image" as const,
      caption: phone.caption,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
    });
  }
  return items;
}

function motionIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "motionShowcase");
}

async function patchDoc(docId: string, idx: number, items: unknown[]) {
  const patch = client.patch(docId).set({
    [`sections[${idx}].sectionTitle`]: "Key Product Experiences",
    [`sections[${idx}].layoutVariant`]: "phoneRow",
    [`sections[${idx}].intro`]: pt(INTRO),
    [`sections[${idx}].rows`]: [
      {
        _type: "motionRow",
        _key: key(),
        device: "mobile",
        items,
      },
    ],
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT),
    [`sections[${idx}].appearance.contentAlignment`]: "center",
  });
  if (!DRY) await patch.commit();
}

async function main() {
  console.log(
    `patch-diamond-valuation-key-product-experiences (${DRY ? "dry" : "live"})`,
  );

  const pub = await client.fetch<{ sections: { _type: string; _key: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _type, _key } }`,
    { id: PUB_ID },
  );
  if (!pub?.sections?.length) throw new Error(`Missing ${PUB_ID}`);

  const idx = motionIdx(pub.sections);
  if (idx < 0) throw new Error("No motionShowcase section on diamond-valuation-ai");

  const items = await buildItems();
  console.log(`→ patch ${PUB_ID} sections[${idx}] (${items.length} phones, phoneRow)`);
  await patchDoc(PUB_ID, idx, items);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, idx, items);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ Key Product Experiences patched (phoneRow — stacked/featured bands unchanged)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
