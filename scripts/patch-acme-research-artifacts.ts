/**
 * Acme Lending — Research Artifacts slider images @4× from Figma Holistic
 * (3795:154389 … 3795:154646 inner slide frames).
 *
 * PNG sources: public/work/acme-lending/artifacts/*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-research-artifacts.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";
const ART_DIR = join(process.cwd(), "public/work/acme-lending/artifacts");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Slider order matches legacy AL_AI_slider 1 → 5 sequence. */
const ARTIFACTS = [
  {
    file: "01-key-platform-features.png",
    caption: "Key Platform Features",
    figma: "3795:154390",
  },
  {
    file: "02-key-observations.png",
    caption: "Key Observations",
    figma: "3795:154426",
  },
  {
    file: "03-user-stories.png",
    caption: "User Stories",
    figma: "3795:154503",
  },
  {
    file: "04-user-flow.png",
    caption: "User Flow",
    figma: "3795:154546",
  },
  {
    file: "05-customer-journey-roadmap.png",
    caption: "Customer Journey Roadmap",
    figma: "3795:154651",
  },
] as const;

async function uploadImage(absPath: string) {
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

type ShowcaseItem = {
  _key: string;
  _type: string;
  caption?: string;
  image?: unknown;
  expandImage?: unknown;
};

async function buildItems(existing: ShowcaseItem[] | undefined) {
  const items = [];
  for (let i = 0; i < ARTIFACTS.length; i++) {
    const spec = ARTIFACTS[i];
    const abs = join(ART_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    const prev = existing?.[i];
    items.push({
      _type: "showcaseItem",
      _key: prev?._key ?? key(),
      caption: prev?.caption?.trim() || spec.caption,
      image,
      expandImage: image,
      order: i + 1,
    });
    console.log(`  [${i + 1}] ${spec.caption} ← ${spec.file} (${spec.figma})`);
  }
  return items;
}

async function main() {
  const doc: {
    _id: string;
    sections: { _key: string; _type: string; sectionTitle?: string; items?: ShowcaseItem[] }[];
  } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      _id,
      sections[]{ _key, _type, sectionTitle, items[]{ _key, _type, caption } }
    }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`No case study: ${SLUG}`);

  const idx = doc.sections.findIndex((s) => s._type === "showcaseGallery");
  if (idx < 0) throw new Error(`${SLUG}: no showcaseGallery section`);

  const before = doc.sections[idx].items?.length ?? 0;
  console.log(`${SLUG} showcaseGallery[${idx}] "${doc.sections[idx].sectionTitle ?? ""}" — ${before} item(s)`);

  const items = await buildItems(doc.sections[idx].items);

  if (DRY) {
    console.log(`(dry run) → replace items (${before} → ${items.length})`);
    return;
  }

  await client
    .patch(doc._id)
    .set({ [`sections[${idx}].items`]: items, [`sections[${idx}].expandable`]: true })
    .commit();

  console.log(`✓ ${SLUG}: Research Artifacts — ${items.length} slide(s) @4× uploaded`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
