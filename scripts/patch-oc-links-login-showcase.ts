/**
 * OC Links login / Design Interventions band (Figma 4004:117780 / mobile 4003:109180).
 * Existing desktopMotionShowcase (`single`): centred login poster,
 * title + collab body bottom-right (Figma 4004:117780). Ignore Figma lorem.
 *
 * PNG @4×: 4004:117892 → public/work/oc-links/key-product/login-desktop.png
 * Band #384E73 (same navy as OC Links CE).
 *
 * Inserts after the staggered-pair KPE. Does not touch that section.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-oc-links-login-showcase.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-oc-links-login-showcase.ts --with-user-token
 *   npx sanity exec scripts/patch-oc-links-login-showcase.ts --with-user-token -- --appearance-only
 *
 * Do not re-run full patch after manual Studio uploads.
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import collab from "./data/caseStudyCollabCopy.json";
import { sanityColor } from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const APPEARANCE_ONLY = process.argv.includes("--appearance-only");
const PUB_ID = "cs-oc-links";
const MOCKUP_FILE = join(
  process.cwd(),
  "public/work/oc-links/key-product/login-desktop.png",
);

const BAND_BG = "#384E73";
const TEXT = "#ffffff";
const SECTION_TITLE = "Design Interventions";
const SECTION_BODY =
  (collab["oc-links" as keyof typeof collab] as { desktopMotion?: { body?: string } })
    .desktopMotion?.body ??
  "A platform demo shows the streamlined crisis-response workflow: a call comes in, a navigator triages it, and a verified referral quickly moves the resident toward care within one system.";

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

type Section = Record<string, unknown> & {
  _key: string;
  _type: string;
  layoutVariant?: string;
};

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

function appearance() {
  return {
    _type: "appearance" as const,
    backgroundColor: sanityColor(BAND_BG),
    textColor: sanityColor(TEXT),
    tileBorderRadius: 0,
    maxWidth: "wide" as const,
  };
}

async function uploadMockup() {
  if (!existsSync(MOCKUP_FILE)) {
    throw new Error(
      `Missing ${MOCKUP_FILE} — export Figma 4004:117892 @4× first`,
    );
  }
  const asset = await client.assets.upload(
    "image",
    createReadStream(MOCKUP_FILE),
    {
      filename: basename(MOCKUP_FILE),
      contentType: "image/png",
    },
  );
  console.log(`  ↑ ${basename(MOCKUP_FILE)} → ${asset._id}`);
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function buildSection(posterImage: unknown, existing?: Section): Section {
  return {
    ...(existing ?? {}),
    _type: "desktopMotionShowcase",
    _key: existing?._key ?? key(),
    layoutVariant: "single",
    sectionTitle: SECTION_TITLE,
    body: pt(SECTION_BODY),
    posterImage,
    videoUrl: undefined,
    videoFile: undefined,
    slides: undefined,
    appearance: appearance(),
  };
}

function findLoginIdx(sections: Section[]) {
  return sections.findIndex(
    (s) =>
      s._type === "desktopMotionShowcase" &&
      s.layoutVariant !== "staggeredPair",
  );
}

async function patchDoc(docId: string) {
  const doc = await client.getDocument(docId);
  if (!doc) return false;

  const sections = [...((doc.sections ?? []) as Section[])];
  let idx = findLoginIdx(sections);
  const staggerIdx = sections.findIndex(
    (s) =>
      s._type === "desktopMotionShowcase" &&
      s.layoutVariant === "staggeredPair",
  );

  if (APPEARANCE_ONLY) {
    if (idx < 0) throw new Error(`${docId}: no login desktopMotionShowcase`);
    if (!DRY) {
      await client
        .patch(docId)
        .set({
          [`sections[${idx}].appearance`]: appearance(),
          [`sections[${idx}].layoutVariant`]: "single",
        })
        .commit();
    }
    console.log(`✓ ${docId}: appearance ${BAND_BG}${DRY ? " (dry)" : ""}`);
    return true;
  }

  const posterImage = DRY ? null : await uploadMockup();
  const sectionKey = idx >= 0 ? sections[idx]._key : key();
  const section = buildSection(posterImage, {
    ...(idx >= 0 ? sections[idx] : {}),
    _key: sectionKey,
    _type: "desktopMotionShowcase",
  });

  if (idx < 0) {
    const insertAt = staggerIdx >= 0 ? staggerIdx + 1 : sections.length;
    sections.splice(insertAt, 0, section);
    idx = insertAt;
    console.log(`${docId}: insert login showcase at sections[${idx}]`);
  } else {
    sections[idx] = section;
    console.log(`${docId}: replace login showcase at sections[${idx}]`);
  }

  if (!DRY) await client.patch(docId).set({ sections }).commit();
  console.log(
    `✓ ${docId}: ${SECTION_TITLE} single${DRY ? " (dry)" : ""}`,
  );
  return true;
}

async function main() {
  console.log(
    `patch-oc-links-login-showcase (${DRY ? "dry" : APPEARANCE_ONLY ? "appearance-only" : "live"})`,
  );
  if (!DRY && !APPEARANCE_ONLY && !existsSync(MOCKUP_FILE)) {
    throw new Error(`Missing PNG: ${MOCKUP_FILE}`);
  }

  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
