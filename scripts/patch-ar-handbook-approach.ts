/**
 * The AR Handbook §05 My Approach / Design Process (Figma 4152:122805).
 * Cream band #e3e3db, teal accordion #658181, left copy #231e1e, panel text black.
 * Copy: scripts/data/caseStudyCollabCopy.json → the-ar-handbook.approach
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-approach.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-approach.ts --with-user-token
 *   npx sanity exec scripts/patch-ar-handbook-approach.ts --with-user-token -- --colors-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COLORS_ONLY = process.argv.includes("--colors-only");
const PUB_ID = "cs-remote-assistant-object-detection";

/** Figma 4152:122805 band */
const BAND_BG = "#e3e3db";
/** Figma 4152:122809 accordion panel — matches CE popup #658181 */
const PANEL_BG = "#658181";
/** Figma 4152:122806 left copy */
const TEXT_COLOR = "#231e1e";
/** Figma 4152:122814 panel copy */
const PANEL_TEXT = "#000000";

const approach = collab["the-ar-handbook" as keyof typeof collab] as {
  approach?: {
    blurb?: string;
    accordion?: { title: string; body: string }[];
  };
};

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

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
    `before ${docId}: band=${s.appearance?.backgroundColor?.hex ?? "unset"} panel=${s.accordionBackgroundColor?.hex ?? "unset"} text=${s.appearance?.textColor?.hex ?? "unset"}`,
  );

  const patch: Record<string, unknown> = {
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT_COLOR),
    [`sections[${idx}].accordionBackgroundColor`]: sanityColor(PANEL_BG),
    [`sections[${idx}].accordionTextColor`]: sanityColor(PANEL_TEXT),
    [`sections[${idx}].variant`]: "split",
    [`sections[${idx}].sideTitle`]: "My Approach",
    [`sections[${idx}].sectionTitle`]: "Design Process",
  };

  if (!COLORS_ONLY) {
    const blurb = approach.approach?.blurb?.trim();
    if (blurb) patch[`sections[${idx}].sideBody`] = pt(blurb);

    const acc = approach.approach?.accordion ?? [];
    if (acc.length) {
      patch[`sections[${idx}].items`] = acc.map((it, i) => ({
        _type: "accordionItem" as const,
        _key: key(),
        title: it.title,
        body: pt(it.body),
        defaultOpen: i === 0,
      }));
    }
  }

  if (!DRY) await client.patch(docId).set(patch).commit();
  console.log(
    `✓ ${docId}: band ${BAND_BG} / panel ${PANEL_BG} / left ${TEXT_COLOR} / panel text ${PANEL_TEXT}${COLORS_ONLY ? " (colors only)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-ar-handbook-approach (${DRY ? "dry" : COLORS_ONLY ? "colors-only" : "live"})`,
  );

  await patchDoc(PUB_ID);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    await patchDoc(draftId);
  }

  if (DRY) console.log("(dry run — no writes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
