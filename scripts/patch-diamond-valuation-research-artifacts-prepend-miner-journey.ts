/**
 * Diamond Valuation AI — prepend Research Artifacts slide 1 (Figma 4002:88593).
 * "The Miner Journey" @4× — was second in migrated WP order (RA_AI_slider_3).
 *
 * PNG: public/work/diamond-valuation-ai/research-artifacts/01-miner-journey.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-diamond-valuation-research-artifacts-prepend-miner-journey.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-diamond-valuation-research-artifacts-prepend-miner-journey.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-diamond-valuation-ai";
const PNG = join(
  process.cwd(),
  "public/work/diamond-valuation-ai/research-artifacts/01-miner-journey.png",
);
const FIGMA = "4002:88593";
const CAPTION = "The Miner Journey";
/** Legacy WP duplicate to drop when reordering. */
const LEGACY_DUP = "RA_AI_slider_3.Jpg.png";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
    contentType: "image/png",
  });
  console.log(`  ↑ ${basename(absPath)} → ${asset._id}`);
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

type ShowcaseItem = {
  _key: string;
  _type: string;
  caption?: string | null;
  image?: unknown;
  expandImage?: unknown;
  order?: number;
};

type Section = {
  _type: string;
  sectionTitle?: string;
  items?: ShowcaseItem[];
};

function galleryIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "showcaseGallery");
}

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{
      sections[]{
        _type, sectionTitle,
        items[]{
          _key, _type, caption, image, expandImage,
          "filename": image.asset->originalFilename
        }
      }
    }`,
    { id: docId },
  );
  if (!doc?.sections?.length) throw new Error(`${docId}: no sections`);

  const idx = galleryIdx(doc.sections);
  if (idx < 0) throw new Error(`${docId}: no showcaseGallery`);

  const existing = (doc.sections[idx].items ?? []) as (ShowcaseItem & {
    filename?: string;
  })[];
  console.log(
    `${docId} showcaseGallery[${idx}] — ${existing.length} item(s) before`,
  );

  const withoutDup = existing.filter((it) => it.filename !== LEGACY_DUP);
  if (withoutDup.length !== existing.length) {
    console.log(`  drop legacy duplicate ${LEGACY_DUP}`);
  }

  if (!existsSync(PNG)) {
    throw new Error(`Missing PNG: ${PNG} — export Figma ${FIGMA} @4× first`);
  }

  const image = DRY
    ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
    : await uploadImage(PNG);

  const first: ShowcaseItem = {
    _type: "showcaseItem",
    _key: key(),
    caption: CAPTION,
    image,
    expandImage: image,
    order: 1,
  };

  const rest = withoutDup.map((it, i) => ({
    _type: "showcaseItem" as const,
    _key: it._key,
    caption: it.caption,
    image: it.image,
    expandImage: it.expandImage ?? it.image,
    order: i + 2,
  }));

  const items = [first, ...rest];
  console.log(`  → ${items.length} item(s): [1] ${CAPTION} (${FIGMA}) + ${rest.length} kept`);

  if (DRY) return;

  await client
    .patch(docId)
    .set({
      [`sections[${idx}].expandable`]: true,
      [`sections[${idx}].items`]: items,
    })
    .commit();

  console.log(`✓ ${docId}: Miner Journey prepended`);
}

async function main() {
  console.log(
    `patch-diamond-valuation-research-artifacts-prepend-miner-journey (${DRY ? "dry" : "live"})`,
  );
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
  if (DRY) console.log("(dry run — no writes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
