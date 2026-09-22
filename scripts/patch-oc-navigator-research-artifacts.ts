/**
 * OC Resource Navigator Research Artifacts — 24 Figma slides @4×
 * (band `4151:57674`; slides `4152:85717`–`87962`).
 *
 * Replaces leftover 29-item WP slider. Intro from collab (ignore Figma lorem).
 * Band stays black / white (already set).
 *
 * PNG: public/work/oc-digital-resource-navigator/research-artifacts/01–24.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-navigator-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-navigator-research-artifacts.ts --with-user-token
 *
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const PUB_ID = "cs-oc-digital-resource-navigator";
const ART_DIR = join(
  process.cwd(),
  "public/work/oc-digital-resource-navigator/research-artifacts",
);
const SECTION_TITLE = "Research Artifacts";

const INTRO = (
  collab["oc-digital-resource-navigator" as keyof typeof collab] as {
    artifacts?: { intro?: string };
  }
).artifacts?.intro?.trim();

/** Order matches the 24 node URLs Fas sent. */
const ARTIFACTS = [
  { file: "01.png", caption: "Understanding the Care Journey", figma: "4152:85717" },
  { file: "02.png", caption: "Journey Map", figma: "4152:85777" },
  { file: "03.png", caption: "Participatory Technology Development", figma: "4152:86123" },
  { file: "04.png", caption: "Participatory Workshop & Key Features", figma: "4152:86137" },
  { file: "05.png", caption: "OC Innovation", figma: "4152:86167" },
  { file: "06.png", caption: "", figma: "4152:86181" },
  { file: "07.png", caption: "", figma: "4152:86193" },
  { file: "08.png", caption: "", figma: "4152:86282" },
  { file: "09.png", caption: "", figma: "4152:86597" },
  { file: "10.png", caption: "", figma: "4152:86809" },
  { file: "11.png", caption: "", figma: "4152:86976" },
  { file: "12.png", caption: "", figma: "4152:87123" },
  { file: "13.png", caption: "", figma: "4152:87170" },
  { file: "14.png", caption: "", figma: "4152:87216" },
  { file: "15.png", caption: "", figma: "4152:87271" },
  { file: "16.png", caption: "", figma: "4152:87320" },
  { file: "17.png", caption: "", figma: "4152:87371" },
  { file: "18.png", caption: "", figma: "4152:87421" },
  { file: "19.png", caption: "", figma: "4152:87470" },
  { file: "20.png", caption: "", figma: "4152:87569" },
  { file: "21.png", caption: "", figma: "4152:87678" },
  { file: "22.png", caption: "", figma: "4152:87781" },
  { file: "23.png", caption: "", figma: "4152:87908" },
  { file: "24.png", caption: "", figma: "4152:87962" },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function pt(text: string) {
  return [
    {
      _type: "block" as const,
      _key: key(),
      style: "normal" as const,
      markDefs: [],
      children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
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

type ShowcaseItem = {
  _key: string;
  _type: string;
  caption?: string;
  image?: unknown;
  expandImage?: unknown;
};

type Section = Record<string, unknown> & {
  _key: string;
  _type: string;
  sectionTitle?: string;
  items?: ShowcaseItem[];
};

function researchIdx(sections: Section[]) {
  const titled = sections.findIndex(
    (s) => s._type === "showcaseGallery" && s.sectionTitle === SECTION_TITLE,
  );
  if (titled >= 0) return titled;
  return sections.findIndex((s) => s._type === "showcaseGallery");
}

async function buildItems() {
  const items = [];
  for (let i = 0; i < ARTIFACTS.length; i++) {
    const spec = ARTIFACTS[i];
    const abs = join(ART_DIR, spec.file);
    if (!existsSync(abs)) throw new Error(`Missing PNG: ${abs}`);
    const image = DRY
      ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
      : await uploadImage(abs);
    items.push({
      _type: "showcaseItem" as const,
      _key: key(),
      caption: spec.caption || undefined,
      image,
      expandImage: image,
      order: i + 1,
    });
    console.log(
      `  [${i + 1}] ${spec.caption || spec.file} ← ${spec.file} (${spec.figma})`,
    );
  }
  return items;
}

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) throw new Error(`${docId}: no sections`);

  const idx = researchIdx(doc.sections);
  if (idx < 0) throw new Error(`${docId}: no showcaseGallery`);

  const before = doc.sections[idx].items?.length ?? 0;
  console.log(
    `${docId} showcaseGallery[${idx}] "${doc.sections[idx].sectionTitle ?? ""}" — ${before} item(s)`,
  );

  const items = await buildItems();
  const patch: Record<string, unknown> = {
    [`sections[${idx}].sectionTitle`]: SECTION_TITLE,
    [`sections[${idx}].expandable`]: true,
    [`sections[${idx}].items`]: items,
  };
  if (INTRO) patch[`sections[${idx}].introBody`] = pt(INTRO);

  if (DRY) {
    console.log(`(dry run) → ${SECTION_TITLE}, ${before} → ${items.length} slide(s)`);
    return;
  }

  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: Research Artifacts — ${before} → ${items.length} slide(s)`);
}

async function main() {
  console.log(`patch-oc-navigator-research-artifacts (${DRY ? "dry" : "live"})`);
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
