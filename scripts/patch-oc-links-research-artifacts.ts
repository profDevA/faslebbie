/**
 * OC Links Research Artifacts — 17 Figma slides @4× (user node list).
 * Replaces the leftover WP slider (more than 17 items) with these 17.
 *
 * PNG: public/work/oc-links/research-artifacts/01–17-*.png
 * Intro: scripts/data/caseStudyCollabCopy.json → oc-links.artifacts.intro
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-research-artifacts.ts --with-user-token
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
const PUB_ID = "cs-oc-links";
const ART_DIR = join(process.cwd(), "public/work/oc-links/research-artifacts");
const SECTION_TITLE = "Research Artifacts";

const INTRO = (
  collab["oc-links" as keyof typeof collab] as {
    artifacts?: { intro?: string };
  }
).artifacts?.intro?.trim();

/** Figma Holistic — order matches the 17 node URLs Fas sent. */
const ARTIFACTS = [
  { file: "01-research-phases.png", caption: "Research Phases", figma: "4004:118509" },
  { file: "02-participant-insights.png", caption: "Participant Insights", figma: "4004:118542" },
  { file: "03-user-journey-map.png", caption: "User Journey Map", figma: "4004:118601" },
  { file: "04-value-proposition-canvas.png", caption: "Value Proposition Canvas", figma: "4004:118749" },
  { file: "05-process-flow.png", caption: "Process Flow", figma: "4004:118814" },
  { file: "06-access-point.png", caption: "Access Point", figma: "4004:118906" },
  { file: "07-navigator-view.png", caption: "Navigator View", figma: "4004:118958" },
  { file: "08-defining-requirements.png", caption: "Defining Requirements", figma: "4004:119012" },
  { file: "09-business-model-canvas.png", caption: "Business Model Canvas", figma: "4004:119023" },
  { file: "10-success-stories.png", caption: "Success Stories", figma: "4004:119102" },
  { file: "11-knowns-unknowns.png", caption: "Knowns & Unknowns", figma: "4004:119154" },
  { file: "12-dispatch-portal.png", caption: "Dispatch Portal", figma: "4004:119185" },
  { file: "13-call-report-section.png", caption: "Call Report Section", figma: "4004:119212" },
  { file: "14-resource-section.png", caption: "Resource Section", figma: "4004:119256" },
  { file: "15-icarol-flow-chart.png", caption: "iCarol Flow Chart", figma: "4004:119282" },
  { file: "16-user-journey.png", caption: "User Journey", figma: "4004:119372" },
  { file: "17-oc-links-overview.png", caption: "OC Links", figma: "4004:119520" },
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
  console.log(`patch-oc-links-research-artifacts (${DRY ? "dry" : "live"})`);
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
