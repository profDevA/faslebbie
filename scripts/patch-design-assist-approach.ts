/**
 * Design Assist AI §04 My Approach / Design Process — Figma 3719:64964.
 * Cream band #e3e3db, lavender accordion #9687a8, left copy #231e1e, panel text black.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-approach.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-approach.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";
const BAND_BG = "#e3e3db";
const PANEL_BG = "#9687a8";
const TEXT_COLOR = "#231e1e";

/** Live WP side copy — not in collab JSON blurb field. */
const SIDE_BODY =
  "My strategy began with a provocation: “How can AI become a new ‘Raw Material’ for design?” Identifying workflow friction, I pivoted our tooling strategy from static documentation to an embedded RAG-powered Figma plugin. I followed a “Skateboard to Airplane” maturity model: starting with designers to validate the infrastructure before scaling enterprise-wide. I aligned Product and Engineering on the data foundation, then operationalized the vision by delegating feature streams to my team, orchestrating our collective efforts toward a high-fidelity MVP.";

function sanityColor(hex: string, alpha = 1) {
  return { _type: "color" as const, hex, alpha };
}

function pt(text: string) {
  return [
    {
      _type: "block" as const,
      _key: "approach-side",
      style: "normal" as const,
      markDefs: [],
      children: [{ _type: "span" as const, _key: "s0", text, marks: [] }],
    },
  ];
}

type Section = {
  _type: string;
  _key: string;
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
  const band = s.appearance?.backgroundColor;
  const panel = s.accordionBackgroundColor;
  const text = s.appearance?.textColor;
  console.log(
    `before ${docId}: band=${band?.hex ?? "unset"} a=${band?.alpha ?? "-"} panel=${panel?.hex ?? "unset"} text=${text?.hex ?? "unset"}`,
  );

  const patch = {
    [`sections[${idx}].appearance.backgroundColor`]: sanityColor(BAND_BG),
    [`sections[${idx}].appearance.textColor`]: sanityColor(TEXT_COLOR),
    [`sections[${idx}].accordionBackgroundColor`]: sanityColor(PANEL_BG),
    [`sections[${idx}].variant`]: "split",
    [`sections[${idx}].sideTitle`]: "My Approach",
    [`sections[${idx}].sectionTitle`]: "Design Process",
    [`sections[${idx}].sideBody`]: pt(SIDE_BODY),
  };

  if (!DRY) {
    await client.patch(docId).set(patch).commit();
  }
  console.log(`✓ ${docId}: band ${BAND_BG} / panel ${PANEL_BG} / text ${TEXT_COLOR}`);
  return true;
}

async function main() {
  console.log(`patch-design-assist-approach (${DRY ? "dry" : "live"})`);

  console.log(`→ patch ${PUB_ID}`);
  await patchDoc(PUB_ID);

  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId);
  }

  const others = await client.fetch<string[]>(
    `*[_type == "caseStudy" && slug.current == $slug && _id != $pub && !(_id in path("drafts.**"))]._id`,
    { slug: SLUG, pub: PUB_ID },
  );
  for (const id of others) {
    console.log(`→ patch ${id}`);
    await patchDoc(id);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ My Approach colors patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
