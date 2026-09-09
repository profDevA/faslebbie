/**
 * Acme Lending — Key Product Experiences (Figma Holistic 3795:152728).
 *
 * Desktop-only band: blue #56a3dc, centred email mockup, copy bottom-right.
 * Unlike Census/Coral, Acme has no §07 motionShowcase mobile top — only this §08 band.
 *
 * PNG source: public/work/acme-lending/key-product/email-verification-mockup.png
 * (export Figma frame 3795:152730 @4× via Figma MCP / manual export).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-acme-key-product-experiences.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-acme-key-product-experiences.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "acme-lending";
const MOCKUP_FILE = join(
  process.cwd(),
  "public/work/acme-lending/key-product/email-verification-mockup.png",
);

const BAND_BG = "#56a3dc";
const TEXT = "#000000";

/** §08 Key Product Experiences — not legacy WP “Design Interventions” (→ Research Artifacts). */
const SECTION_TITLE = "Key Product Experiences";
const SECTION_BODY =
  collab[SLUG as keyof typeof collab]?.desktopMotion?.body ??
  "A product demo shows TX Verify's API integration replacing manual document uploads with secure, user-authorized data access: a borrower grants permission once, and verified income flows through automatically thereafter.";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & { _key: string; _type: string };

function pt(text: string) {
  return [
    {
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    },
  ];
}

async function uploadMockup() {
  if (!existsSync(MOCKUP_FILE)) {
    throw new Error(
      `Missing ${MOCKUP_FILE} — export Figma 3795:152730 @4× first`,
    );
  }
  const asset = await client.assets.upload(
    "image",
    createReadStream(MOCKUP_FILE),
    {
      filename: "acme-key-product-email-mockup.png",
      contentType: "image/png",
    },
  );
  console.log(`  ↑ mockup → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function buildDesktopSection(posterImage: unknown, existing?: Section): Section {
  return {
    ...(existing ?? {}),
    _type: "desktopMotionShowcase",
    _key: existing?._key ?? key(),
    sectionTitle: SECTION_TITLE,
    body: pt(SECTION_BODY),
    posterImage,
    videoUrl: undefined,
    videoFile: undefined,
    appearance: {
      _type: "appearance",
      backgroundColor: sanityColor(BAND_BG),
      textColor: sanityColor(TEXT),
      maxWidth: "wide",
    },
  };
}

async function main() {
  const doc: { _id: string; sections: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      _id,
      sections
    }`,
    { slug: SLUG },
  );
  if (!doc?._id) throw new Error(`case study not found: ${SLUG}`);

  const before = doc.sections ?? [];
  const motionIdx = before.findIndex((s) => s._type === "motionShowcase");
  const desktopIdx = before.findIndex((s) => s._type === "desktopMotionShowcase");

  console.log(`${SLUG} — Key Product Experiences (Figma 3795:152728, desktop-only)`);
  if (motionIdx >= 0) {
    console.log(
      `  drop motionShowcase[${motionIdx}] "${String(before[motionIdx].sectionTitle ?? "")}"`,
    );
  }
  console.log(
    desktopIdx >= 0
      ? `  update desktopMotionShowcase[${desktopIdx}]`
      : "  insert desktopMotionShowcase after Research Artifacts",
  );

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  const posterImage = await uploadMockup();
  let sections = before.filter((s) => s._type !== "motionShowcase");
  const nextDesktopIdx = sections.findIndex(
    (s) => s._type === "desktopMotionShowcase",
  );

  if (nextDesktopIdx >= 0) {
    sections = sections.map((s, i) =>
      i === nextDesktopIdx
        ? buildDesktopSection(posterImage, s)
        : s,
    );
  } else {
    const artIdx = sections.findIndex((s) => s._type === "showcaseGallery");
    const insertAt = artIdx >= 0 ? artIdx + 1 : sections.length;
    sections = [
      ...sections.slice(0, insertAt),
      buildDesktopSection(posterImage),
      ...sections.slice(insertAt),
    ];
  }

  await client.patch(doc._id).set({ sections }).commit();
  console.log(
    `✓ ${SLUG}: Key Product Experiences — ${before.length} → ${sections.length} section(s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
