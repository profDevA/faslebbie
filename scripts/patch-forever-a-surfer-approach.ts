/**
 * Forever a Surfer §05 My Approach / Design Process
 * (Figma desktop `4162:23171` / mobile `4162:24607` approach band).
 *
 * Cream band #e3e3db, teal accordion #007b76 (`4162:23175`), left #231e1e, panel text white.
 * Copy: live WP / case-studies.generated.ts (ignore Figma Coral lorem + 4-item accordion).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-forever-a-surfer-approach.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-forever-a-surfer-approach.ts --with-user-token
 *   npx sanity exec scripts/patch-forever-a-surfer-approach.ts --with-user-token -- --colors-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { generatedCaseStudies } from "../src/lib/case-studies.generated";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COLORS_ONLY = process.argv.includes("--colors-only");
const SLUG = "forever-a-surfer";

/** Figma 4162:23171 band */
const BAND_BG = "#e3e3db";
/** Figma 4162:23175 accordion column (same token as Memory Tubes) */
const PANEL_BG = "#007b76";
/** Figma 4162:23172 left copy */
const TEXT_COLOR = "#231e1e";
/** Figma 4162:23180+ panel copy on teal */
const PANEL_TEXT = "#ffffff";

const wp = generatedCaseStudies[SLUG].approach as {
  blurb: string;
  process: { title: string; paras: string[]; bullets?: string[] }[];
};

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function ptBlock(text: string, listItem?: "bullet") {
  return {
    _type: "block" as const,
    _key: key(),
    style: "normal" as const,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [],
    children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
  };
}

function parasToPt(paras: string[]) {
  return paras.map((text) => ptBlock(text));
}

function processBody(item: { paras: string[]; bullets?: string[] }) {
  const blocks = parasToPt(item.paras ?? []);
  for (const b of item.bullets ?? []) {
    blocks.push(ptBlock(b, "bullet"));
  }
  return blocks;
}

type Section = {
  _type: string;
  appearance?: {
    backgroundColor?: { hex?: string; alpha?: number };
    textColor?: { hex?: string; alpha?: number };
  };
  accordionBackgroundColor?: { hex?: string; alpha?: number };
};

function accordionIdx(sections: Section[]) {
  return sections.findIndex((s) => s._type === "accordionSection");
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = (doc.sections ?? []) as Section[];
  const idx = accordionIdx(sections);
  if (idx < 0) throw new Error(`${docId}: no accordionSection`);

  const s = sections[idx];
  console.log(
    `before ${docId}: band=${s.appearance?.backgroundColor?.hex ?? "unset"} panel=${s.accordionBackgroundColor?.hex ?? "unset"}`,
  );

  const patch = client.patch(docId).set({
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT_COLOR),
    [`sections[${idx}].accordionBackgroundColor`]: sanityColor(PANEL_BG),
    [`sections[${idx}].accordionTextColor`]: sanityColor(PANEL_TEXT),
    [`sections[${idx}].variant`]: "split",
    [`sections[${idx}].sideTitle`]: "My Approach",
    [`sections[${idx}].sectionTitle`]: "Design Process",
  });

  if (!COLORS_ONLY) {
    patch.set({
      [`sections[${idx}].sideBody`]: parasToPt([wp.blurb]),
      [`sections[${idx}].items`]: wp.process.map((it, i) => ({
        _type: "accordionItem" as const,
        _key: key(),
        title: it.title,
        body: processBody(it),
        defaultOpen: i === 0,
      })),
    });
  }

  if (!DRY) await patch.commit();
  console.log(
    `✓ ${docId}: band ${BAND_BG} / panel ${PANEL_BG} / left ${TEXT_COLOR} / panel text ${PANEL_TEXT}${COLORS_ONLY ? " (colors only)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-forever-a-surfer-approach (${DRY ? "dry" : COLORS_ONLY ? "colors-only" : "live"})`,
  );

  const pub = await client.fetch<{ _id: string }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`Missing published ${SLUG}`);

  await patchDoc(pub._id);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    await patchDoc(draftId);
  }

  if (DRY) console.log("(dry run — no writes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
