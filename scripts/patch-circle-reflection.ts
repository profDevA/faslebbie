/**
 * Circle §11 Reflection + Next Steps — existing reflectionSection.
 * Desktop Figma 4171:33600 / mobile 4171:38559. Band #171717 (sampled).
 *
 * No Circle collab reflection yet, so this writes the Figma lorem.
 * Heading “reflections” (site capitalize → Reflections). Next Steps is one
 * paragraph, not a three-item list. Mobile heading 4171:38569 says
 * “Problem Context” — leftover; desktop “Next Steps” is used.
 *
 * Full Case Study line is the shared footer (default intro already matches
 * Figma). It stays hidden until a PDF is on the case study document.
 * Does not set fullCaseStudyPdf.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-circle-reflection.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-circle-reflection.ts --with-user-token
 *   npx sanity exec scripts/patch-circle-reflection.ts --with-user-token -- --appearance-only
 */
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { REFLECTION_APPEARANCE_DEFAULTS } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "circle";

const BODY =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit voluptate velit.";

const NEXT =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt.";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

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

function appearance() {
  return {
    _type: "appearance" as const,
    ...REFLECTION_APPEARANCE_DEFAULTS,
  };
}

function copyFields() {
  return {
    reflectionHeading: "reflections",
    reflectionBody: pt(BODY),
    nextStepsHeading: "Next Steps",
    nextStepsItems: [NEXT],
    appearance: appearance(),
  };
}

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, sections }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  const sections = [...(doc.sections ?? [])];
  let idx = sections.findIndex((s) => s._type === "reflectionSection");
  const highlightIdx = sections.findIndex((s) => s._type === "highlightReel");

  console.log(`${SLUG} — Reflection (Figma 4171:33600 / 4171:38559)`);

  if (APPEARANCE_ONLY) {
    if (idx < 0) throw new Error("no reflectionSection");
    if (DRY) {
      console.log("(dry run — appearance only)");
      return;
    }
    await client
      .patch(doc._id)
      .set({ [`sections[${idx}].appearance`]: appearance() })
      .commit();
    console.log(`✓ ${doc._id}: reflection appearance #171717`);
    return;
  }

  if (idx < 0) {
    const insertAt = highlightIdx >= 0 ? highlightIdx + 1 : sections.length;
    sections.splice(insertAt, 0, {
      _type: "reflectionSection",
      _key: key(),
      ...copyFields(),
    });
    idx = insertAt;
    console.log(`  insert reflectionSection at sections[${idx}]`);
    if (!DRY) await client.patch(doc._id).set({ sections }).commit();
  } else {
    console.log(`  patch reflectionSection at sections[${idx}]`);
    if (!DRY) {
      await client
        .patch(doc._id)
        .set(
          Object.fromEntries(
            Object.entries(copyFields()).map(([k, v]) => [`sections[${idx}].${k}`, v]),
          ),
        )
        .commit();
    }
  }

  console.log(
    `✓ ${doc._id}: reflections + 1 next-step paragraph${DRY ? " (dry)" : ""}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
