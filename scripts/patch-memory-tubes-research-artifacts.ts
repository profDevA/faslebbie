/**
 * Memory Tubes Research Artifacts — 10 Figma slides @4×
 * (band `4152:101895`; slides per user node list).
 *
 * Replaces legacy WP portrait slider. Intro from collab (ignore Figma lorem).
 * Black band / expandable 3-up (existing showcaseGallery).
 *
 * PNG: public/work/memory-tubes/research-artifacts/01–10-*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-research-artifacts.ts --with-user-token
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
const SLUG = "memory-tubes";
const ART_DIR = join(process.cwd(), "public/work/memory-tubes/research-artifacts");
const SECTION_TITLE = "Research Artifacts";

const INTRO = (
  collab[SLUG as keyof typeof collab] as {
    artifacts?: { intro?: string };
  }
).artifacts?.intro?.trim();

/** Order matches Figma nodes Fas sent. */
const ARTIFACTS = [
  {
    file: "01-urban-needs-analysis-matrix.png",
    caption: "Urban Needs Analysis Matrix",
    figma: "4152:132762",
  },
  {
    file: "02-design-intervention-strategy-framework.png",
    caption: "Design Intervention Strategy Framework",
    figma: "4152:132859",
  },
  {
    file: "03-provotype-concept-generation.png",
    caption: "Provotype Concept Generation",
    figma: "4152:133123",
  },
  {
    file: "04-memory-tube-system-architecture.png",
    caption: "Memory Tube System Architecture",
    figma: "4152:133218",
  },
  {
    file: "05-prompt-development-process.png",
    caption: "Prompt Development Process",
    figma: "4152:133266",
  },
  {
    file: "06-prompt-design-categorization.png",
    caption: "Prompt Design Categorization",
    figma: "4152:133313",
  },
  {
    file: "07-wheel-of-reasoning.png",
    caption: "Wheel of Reasoning",
    figma: "4152:133367",
  },
  {
    file: "08-sense-making.png",
    caption: "Sense Making",
    figma: "4152:133451",
  },
  {
    file: "09-integrated-methodology.png",
    caption: "Integrated Methodology",
    figma: "4152:133471",
  },
  {
    file: "10-present-moment-prompt-breakthrough.png",
    caption: "Present-Moment Prompt Breakthrough",
    figma: "4152:133493",
  },
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
      caption: spec.caption,
      image,
      expandImage: image,
      order: i + 1,
    });
    console.log(`  [${i + 1}] ${spec.caption} ← ${spec.file} (${spec.figma})`);
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
  console.log(`patch-memory-tubes-research-artifacts (${DRY ? "dry" : "live"})`);

  const pub = await client.fetch<{ _id: string }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`Missing published ${SLUG}`);

  await patchDoc(pub._id);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
