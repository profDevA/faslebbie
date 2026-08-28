/**
 * Coral §04 — per-screen tiles for Core Experience Flow (Figma 2110:39499).
 *
 * Uploads PNGs from public/work/coral-health/core-flow/*.png and sets Figma copy.
 * Keeps legacy `image` as fallback until previewScreens is populated.
 *
 * Expected files (export @2× from Figma phone frames):
 *   01-personalized-care.png
 *   02-health-results.png
 *   03-at-home-testing.png
 *   04-in-home-care.png
 *   05-virtual-consultation.png
 *
 * Popup: add more PNGs to public/work/coral-health/core-flow/popup/ — optional.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-coral-core-experience-screens.ts --with-user-token
 */
import { createReadStream, existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "coral-health";
const PUBLIC = join(process.cwd(), "public");
const FLOW_DIR = join(PUBLIC, "work/coral-health/core-flow");
const POPUP_DIR = join(FLOW_DIR, "popup");

const PREVIEW = [
  {
    file: "01-personalized-care.png",
    label: "Personalized Care:",
    description: "Recommended actions, all in one place",
  },
  {
    file: "02-health-results.png",
    label: "Health Results:",
    description: "Clear guidance from screening to next step",
  },
  {
    file: "03-at-home-testing.png",
    label: "At-Home Testing:",
    description: "Screening designed around your schedule",
  },
  {
    file: "04-in-home-care.png",
    label: "In-Home Care:",
    description: "Book professional support when you need it",
  },
  {
    file: "05-virtual-consultation.png",
    label: "Virtual Consultation:",
    description: "Connect directly with your care team",
  },
] as const;

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function uploadImage(relPath: string) {
  const abs = join(PUBLIC, relPath.replace(/^\//, ""));
  if (!existsSync(abs)) return null;
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  return { _type: "image" as const, asset: { _type: "reference" as const, _ref: asset._id } };
}

async function uploadDir(dir: string, relPrefix: string) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  files.sort();
  const out: {
    _key: string;
    _type: "coreExperienceScreen";
    image: NonNullable<Awaited<ReturnType<typeof uploadImage>>>;
    label?: string;
    description?: string;
  }[] = [];

  for (const file of files) {
    const image = await uploadImage(`${relPrefix}/${file}`);
    if (!image) continue;
    out.push({
      _key: key(),
      _type: "coreExperienceScreen",
      image,
      label: basename(file, file.slice(file.lastIndexOf("."))),
    });
  }
  return out;
}

async function main() {
  const docId = await client.fetch<string>(
    `*[_type == "caseStudy" && slug.current == $slug][0]._id`,
    { slug: SLUG },
  );
  if (!docId) throw new Error(`no case study: ${SLUG}`);

  const doc = await client.fetch<{ sections: { _key: string; _type: string }[] }>(
    `*[_id == $id][0]{ sections[]{ _key, _type } }`,
    { id: docId },
  );
  const idx = doc.sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) throw new Error("no coreExperience section on Coral");

  const previewScreens: {
    _key: string;
    _type: "coreExperienceScreen";
    image: NonNullable<Awaited<ReturnType<typeof uploadImage>>>;
    label: string;
    description: string;
  }[] = [];

  for (const row of PREVIEW) {
    const rel = `work/coral-health/core-flow/${row.file}`;
    const image = await uploadImage(rel);
    if (!image) {
      console.warn(`! missing ${rel} — skip (export from Figma frame)`);
      continue;
    }
    previewScreens.push({
      _key: key(),
      _type: "coreExperienceScreen",
      image,
      label: row.label,
      description: row.description,
    });
  }

  if (!previewScreens.length) {
    console.error(
      "No preview PNGs found. Add files under public/work/coral-health/core-flow/ then re-run.",
    );
    process.exit(1);
  }

  const popupScreens = await uploadDir(
    POPUP_DIR,
    "work/coral-health/core-flow/popup",
  );

  await client
    .patch(docId)
    .set({
      [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
      [`sections[${idx}].layoutVariant`]: "mobileRow",
      [`sections[${idx}].viewMoreLabel`]: "View More",
      [`sections[${idx}].previewScreens`]: previewScreens,
      ...(popupScreens.length
        ? { [`sections[${idx}].popupScreens`]: popupScreens }
        : {}),
    })
    .commit();

  console.log(
    `✓ ${SLUG}: previewScreens=${previewScreens.length}` +
      (popupScreens.length ? ` popupScreens=${popupScreens.length}` : " (popup reuses preview)"),
  );

  for (const id of [`drafts.${docId}`]) {
    const draft = await client.fetch<{ sections?: unknown[] } | null>(
      `*[_id == $id][0]{ sections }`,
      { id },
    );
    if (!draft?.sections) continue;
    await client
      .patch(id)
      .set({
        [`sections[${idx}].sectionTitle`]: "Core Experience Flow",
        [`sections[${idx}].layoutVariant`]: "mobileRow",
        [`sections[${idx}].viewMoreLabel`]: "View More",
        [`sections[${idx}].previewScreens`]: previewScreens,
        ...(popupScreens.length
          ? { [`sections[${idx}].popupScreens`]: popupScreens }
          : {}),
      })
      .commit();
    console.log(`✓ synced draft ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
