/**
 * Design Assist AI §05 Research Artifacts — Figma 3719:66249 band + 4 slides @4×
 * from asset board 3719:64053 (frames 64062, 64112, 64159, 64198).
 *
 * PNG: public/work/design-assist-ai/research-artifacts/01–04-*.png
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-research-artifacts.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";
const ART_DIR = join(process.cwd(), "public/work/design-assist-ai/research-artifacts");

const SECTION_TITLE = "Research Artifacts";
const DI_TITLE = "Design Interventions";
const BAND_BG = "#171717";

/** Live WP Toolkit / Research Artifacts intro — fasandsabrina.com/case-studies/design-assist-ai/ */
const INTRO =
  "During the research, we analyzed 300+ Figma files, conducted 17 interviews, and 20 contextual inquiries. This uncovered barriers to design system adoption at Meta EISA. Findings showed 46% inconsistent Blueprint usage, 25% time lost searching components, and high compliance errors, with friction extending beyond designers to cross-functional dependencies.";

/** Figma 3719:64053 slide order (top row L→R, bottom row L→R). */
const ARTIFACTS = [
  {
    file: "01-data-architecture.png",
    caption: "Data Architecture Behind Design Assist",
    figma: "3719:64062",
  },
  {
    file: "02-rag-knowledge-pipeline.png",
    caption: "RAG Knowledge Pipeline Map",
    figma: "3719:64112",
  },
  {
    file: "03-prompt-library-map.png",
    caption: "Prompt Library Categorization Map",
    figma: "3719:64159",
  },
  {
    file: "04-design-assist-workshop.png",
    caption: "Workshop Synthesis",
    figma: "3719:64198",
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
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
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
    (s) =>
      s._type === "showcaseGallery" &&
      (s.sectionTitle === SECTION_TITLE ||
        s.sectionTitle === "Toolkit, Methods & Frameworks"),
  );
  if (titled >= 0) return titled;
  return sections.findIndex(
    (s) => s._type === "showcaseGallery" && s.sectionTitle !== DI_TITLE,
  );
}

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
  if (idx < 0) throw new Error(`${docId}: no research showcaseGallery`);

  const before = doc.sections[idx].items?.length ?? 0;
  console.log(
    `${docId} showcaseGallery[${idx}] "${doc.sections[idx].sectionTitle ?? ""}" — ${before} item(s)`,
  );

  const items = await buildItems(doc.sections[idx].items);
  const patch = {
    [`sections[${idx}].sectionTitle`]: SECTION_TITLE,
    [`sections[${idx}].introBody`]: pt(INTRO),
    [`sections[${idx}].expandable`]: true,
    [`sections[${idx}].items`]: items,
    [`sections[${idx}].appearance`]: {
      _type: "appearance",
      backgroundColor: sanityColor(BAND_BG),
      textColor: sanityColor("#ffffff"),
    },
  };

  if (DRY) {
    console.log(`(dry run) → ${SECTION_TITLE}, ${items.length} slide(s), band ${BAND_BG}`);
    return;
  }

  await client.patch(docId).set(patch).commit();
  console.log(`✓ ${docId}: Research Artifacts — ${items.length} slide(s)`);
}

async function main() {
  console.log(`patch-design-assist-research-artifacts (${DRY ? "dry" : "live"})`);
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
