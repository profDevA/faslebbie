/**
 * Memory Tubes §05 My Approach / Design Process
 * (Figma desktop `4152:101875` / mobile `4152:103447`).
 *
 * Cream band #e3e3db, teal accordion #007b76 (Figma `4152:101879`), left #231e1e, panel text white.
 * Accordion: scripts/data/caseStudyCollabCopy.json → memory-tubes.approach (ignore Figma Coral lorem in frames).
 * No collab blurb in JSON — unset sideBody (ignore Figma lorem on `4152:101878`).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-memory-tubes-approach.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-memory-tubes-approach.ts --with-user-token
 *   npx sanity exec scripts/patch-memory-tubes-approach.ts --with-user-token -- --colors-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COLORS_ONLY = process.argv.includes("--colors-only");
const SLUG = "memory-tubes";

/** Figma 4152:101875 band */
const BAND_BG = "#e3e3db";
/** Figma 4152:101879 accordion column */
const PANEL_BG = "#007b76";
/** Figma 4152:101876 left copy */
const TEXT_COLOR = "#231e1e";
/** Figma 4152:101881–101893 accordion copy on teal */
const PANEL_TEXT = "#ffffff";

const approach = collab[SLUG as keyof typeof collab] as {
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
    const blurb = approach.approach?.blurb?.trim();
    if (blurb) {
      patch.set({ [`sections[${idx}].sideBody`]: pt(blurb) });
    } else {
      patch.unset([`sections[${idx}].sideBody`]);
    }

    const acc = approach.approach?.accordion ?? [];
    if (acc.length) {
      patch.set({
        [`sections[${idx}].items`]: acc.map((it, i) => ({
          _type: "accordionItem" as const,
          _key: key(),
          title: it.title,
          body: pt(it.body),
          defaultOpen: i === 0,
        })),
      });
    }
  }

  if (!DRY) await patch.commit();
  console.log(
    `✓ ${docId}: band ${BAND_BG} / panel ${PANEL_BG} / left ${TEXT_COLOR} / panel text ${PANEL_TEXT}${COLORS_ONLY ? " (colors only)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-memory-tubes-approach (${DRY ? "dry" : COLORS_ONLY ? "colors-only" : "live"})`,
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
