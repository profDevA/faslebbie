/**
 * Circle §05 My Approach / Design Process (Figma `4171:32996`).
 *
 * Cream band `#e3e3db`, black accordion `#171717`, left copy `#231e1e`, panel text white.
 * Side blurb is the frame lorem. Four accordion titles from the frame. Each
 * row body is provisional lorem (the open row’s healthcare paragraph in
 * `4171:33005` is leftover Coral Health).
 * Does not touch Research Artifacts — that band is
 * `patch-circle-research-artifacts.ts`.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-approach.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-approach.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-approach.ts --with-user-token -- --colors-only
 *   npx sanity exec scripts/patch-circle-approach.ts --with-user-token -- --copy-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const COLORS_ONLY = process.argv.includes("--colors-only");
const COPY_ONLY = process.argv.includes("--copy-only");
const SLUG = "circle";

/** Figma 4171:32996 band */
const BAND_BG = "#e3e3db";
/** Figma 4171:33000 accordion column */
const PANEL_BG = "#171717";
/** Figma 4171:32997 left copy */
const TEXT_COLOR = "#231e1e";
/** Figma 4171:33002–33014 panel copy */
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
  _key: string;
  _type: string;
  sectionTitle?: string;
  appearance?: {
    backgroundColor?: { hex?: string; alpha?: number };
    textColor?: { hex?: string; alpha?: number };
  };
  accordionBackgroundColor?: { hex?: string; alpha?: number };
};

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = (doc.sections ?? []) as Section[];
  const idx = sections.findIndex((s) => s._type === "accordionSection");
  if (idx < 0) throw new Error(`${docId}: no accordionSection`);

  console.log(
    `${docId}: sections ${sections.map((s) => s._type).join(", ")}`,
  );
  console.log(
    `before accordion: band=${sections[idx].appearance?.backgroundColor?.hex ?? "unset"} panel=${sections[idx].accordionBackgroundColor?.hex ?? "unset"}`,
  );

  const patch = client.patch(docId);

  if (!COPY_ONLY) {
    patch.set({
      [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
      [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT_COLOR),
      [`sections[${idx}].accordionBackgroundColor`]: sanityColor(PANEL_BG),
      [`sections[${idx}].accordionTextColor`]: sanityColor(PANEL_TEXT),
      [`sections[${idx}].variant`]: "split",
      [`sections[${idx}].sideTitle`]: "My Approach",
      [`sections[${idx}].sectionTitle`]: "Design Process",
    });
  }

  if (!COLORS_ONLY) {
    const blurb = approach.approach?.blurb?.trim();
    if (blurb) patch.set({ [`sections[${idx}].sideBody`]: pt(blurb) });

    const acc = approach.approach?.accordion ?? [];
    if (acc.length) {
      patch.set({
        [`sections[${idx}].items`]: acc.map((it, i) => ({
          _type: "accordionItem" as const,
          _key: key(),
          title: it.title,
          ...(it.body.trim() ? { body: pt(it.body) } : {}),
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
    `patch-circle-approach (${DRY ? "dry" : COLORS_ONLY ? "colors-only" : COPY_ONLY ? "copy-only" : "live"})`,
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
