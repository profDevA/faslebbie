/**
 * OC Resource Navigator §04 Core Experience Flow band (Figma 4151:56987).
 *
 * Four desktop tiles — 2×2 staggered desktopGrid + mobile stack (Census / OC Links).
 * Captions from desktop Figma (ignore leftover FDX copy on mobile 4151:59346).
 * Title/CTA: Core Experience Flow / View More (ignore leftover Foam heading).
 *
 * PNG source: public/work/oc-digital-resource-navigator/core-flow/01–04-*
 *   01 — 4151:69147 Discover Resources
 *   02 — 4151:69190 Personalized Assessment
 *   03 — 4151:69334 Tailored Recommendations
 *   04 — 4151:69410 Connect to Care
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-navigator-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-navigator-core-experience.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-navigator-core-experience.ts --with-user-token -- --appearance-only
 *
 * Does not write popup tabs — see patch-oc-navigator-core-experience-popup.ts.
 * Do not re-run after manual Studio image uploads.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const SLUG = "oc-digital-resource-navigator";
const FLOW_DIR = join(
  process.cwd(),
  "public/work/oc-digital-resource-navigator/core-flow",
);

/** Figma 4151:56987 band fill (sampled from desktop screenshot). */
const BAND_BG = "#a1cbdc";
const TEXT = "#231e1e";

const PREVIEW = [
  {
    file: "01-discover-resources.png",
    figma: "4151:69147",
    label: "Discover Resources:",
    description:
      "Explore local services and begin your personalized care journey.",
  },
  {
    file: "02-personalized-assessment.png",
    figma: "4151:69190",
    label: "Personalized Assessment:",
    description:
      "Understand individual needs through guided questions and screening.",
  },
  {
    file: "03-tailored-recommendations.png",
    figma: "4151:69334",
    label: "Tailored Recommendations:",
    description:
      "Receive relevant services matched to your unique circumstances.",
  },
  {
    file: "04-connect-to-care.png",
    figma: "4151:69410",
    label: "Connect to Care:",
    description:
      "Access trusted providers with everything needed to take action.",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

function pngSize(abs: string) {
  const buf = readFileSync(abs);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
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

async function buildScreens() {
  const screens = [];
  for (const row of PREVIEW) {
    const abs = join(FLOW_DIR, row.file);
    if (!existsSync(abs)) throw new Error(`Missing ${abs}`);
    const { width: imageWidth, height: imageHeight } = pngSize(abs);
    console.log(
      `${DRY ? "○" : "↑"} ${row.file} (${row.figma}) ${imageWidth}x${imageHeight}`,
    );
    screens.push({
      _key: key(),
      _type: "coreExperienceScreen" as const,
      image: DRY
        ? { _type: "image", asset: { _type: "reference", _ref: "dry-run" } }
        : await uploadImage(abs),
      label: row.label,
      description: row.description,
      imageWidth,
      imageHeight,
    });
  }
  return screens;
}

type Section = {
  _type: string;
  _key?: string;
  appearance?: Record<string, unknown>;
  previewAppearance?: Record<string, unknown>;
};

function appearanceFields(section?: Section) {
  const previewAppearance = {
    ...(section?.previewAppearance ?? {}),
    _type: "appearance",
    tileBackgroundColor: sanityColor(BAND_BG),
    contentGap: 56,
    contentGapInner: 115,
  };
  delete previewAppearance.tileBorderRadius;
  return {
    appearance: {
      ...(section?.appearance ?? {}),
      _type: "appearance",
      backgroundColor: sanityColor(BAND_BG),
      textColor: sanityColor(TEXT),
      contentAlignment: "center",
    },
    previewAppearance,
  };
}

function ceIdx(sections: { _type: string }[]) {
  return sections.findIndex((s) => s._type === "coreExperience");
}

async function ensureCe(docId: string, sections: Section[]) {
  const existing = ceIdx(sections);
  if (existing >= 0) return existing;

  const problemIdx = sections.findIndex(
    (s) => s._type === "problemContextSection",
  );
  const insertAt = problemIdx >= 0 ? problemIdx + 1 : sections.length;
  const next = [...sections];
  next.splice(insertAt, 0, {
    _type: "coreExperience",
    _key: key(),
  });
  console.log(`  insert coreExperience at [${insertAt}]`);
  if (!DRY) {
    await client.patch(docId).set({ sections: next }).commit();
  }
  return insertAt;
}

async function patchDoc(
  docId: string,
  previewScreens?: Awaited<ReturnType<typeof buildScreens>>,
) {
  const doc = await client.getDocument(docId);
  if (!doc) return;
  const sections = (doc.sections ?? []) as Section[];
  const idx = await ensureCe(docId, sections);
  const live = DRY
    ? sections
    : ((await client.getDocument(docId))?.sections as Section[] | undefined) ??
      sections;
  const section = live[idx];
  const fields = appearanceFields(section);

  if (APPEARANCE_ONLY) {
    if (DRY) {
      console.log(`dry-run ${docId}: appearance-only bg=${BAND_BG}`);
      return;
    }
    await client
      .patch(docId)
      .set({
        [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
        [`sections[${idx}].layoutVariant`]: "desktopGrid",
        [`sections[${idx}].previewColumns`]: 2,
        [`sections[${idx}].previewRowStagger`]: 191,
        [`sections[${idx}].viewMoreLabel`]: "View More",
        [`sections[${idx}].appearance`]: fields.appearance,
        [`sections[${idx}].previewAppearance`]: fields.previewAppearance,
      })
      .commit();
    console.log(`✓ ${docId}: OC Navigator CE band appearance`);
    return;
  }

  if (!previewScreens) throw new Error("previewScreens required");
  const patch = {
    [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
    [`sections[${idx}].layoutVariant`]: "desktopGrid",
    [`sections[${idx}].previewColumns`]: 2,
    [`sections[${idx}].previewRowStagger`]: 191,
    [`sections[${idx}].viewMoreLabel`]: "View More",
    [`sections[${idx}].appearance`]: fields.appearance,
    [`sections[${idx}].previewAppearance`]: fields.previewAppearance,
    [`sections[${idx}].body`]: [],
    [`sections[${idx}].previewScreens`]: previewScreens,
  };

  if (DRY) {
    console.log(
      `dry-run ${docId}: preview=${previewScreens.length}, desktopGrid ${BAND_BG}`,
    );
    return;
  }

  await client
    .patch(docId)
    .set(patch)
    .unset([
      `sections[${idx}].image`,
      `sections[${idx}].imageMobile`,
      `sections[${idx}].mobilePreviewScreens`,
    ])
    .commit();
  console.log(
    `✓ ${docId}: OC Navigator CE band (${previewScreens.length} tiles, ${BAND_BG})`,
  );
}

async function main() {
  console.log(
    `patch-oc-navigator-core-experience (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );

  const pub = await client.fetch<{ _id: string; sections: { _type: string }[] }>(
    `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, sections[]{ _type }
    }`,
    { slug: SLUG },
  );
  if (!pub?.sections?.length) throw new Error(`Missing published ${SLUG}`);
  console.log(
    `doc ${pub._id} sections: ${pub.sections.map((s) => s._type).join(" → ")}`,
  );

  const previewScreens = APPEARANCE_ONLY ? undefined : await buildScreens();

  console.log(`→ patch ${pub._id}`);
  await patchDoc(pub._id, previewScreens);

  const draftId = `drafts.${pub._id}`;
  if (await client.getDocument(draftId)) {
    console.log(`→ sync ${draftId}`);
    await patchDoc(draftId, previewScreens);
  }

  if (DRY) {
    console.log("(dry run — no writes)");
    return;
  }

  console.log("✓ OC Resource Navigator Core Experience band patched");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
