/**
 * Patch extra-eight student popup copy + 3x Figma slides onto teachingPage.
 * Does not replace the original 14 students or their carousels.
 *
 * Expects files in tmp/student-slides/<id>/01.png, 02.png, ...
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-student-popup-slides.ts --with-user-token
 */
import { createReadStream, readdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

import { STUDENT_POPUP_COPY } from "../src/lib/studentPopupCopy";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DIR = join(process.cwd(), "tmp", "student-slides");
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const ORIGINAL_IDS = new Set([
  "new-transport",
  "the-little-home",
  "welcome-to-walkatopia",
  "phoneless",
  "ephemeral",
  "compare-n-go",
  "origin",
  "trash-to-treasure",
  "pads-tampons-cups",
  "ecolivery",
  "nudge",
  "honey-honey",
  "uum",
  "spinning-out",
]);

async function uploadSlides(id: string) {
  const dir = join(DIR, id);
  let files: string[] = [];
  try {
    files = readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort();
  } catch {
    console.warn(`  ! missing folder: tmp/student-slides/${id}`);
    return undefined;
  }
  if (!files.length) {
    console.warn(`  ! no images in tmp/student-slides/${id}`);
    return undefined;
  }

  const images = [];
  for (const file of files) {
    const asset = await client.assets.upload(
      "image",
      createReadStream(join(dir, file)),
      { filename: `${id}-${file}`, contentType: "image/png" },
    );
    images.push({
      _type: "image" as const,
      _key: key(),
      asset: { _type: "reference" as const, _ref: asset._id },
    });
    console.log(`    ↑ ${file} → ${asset._id}`);
  }
  return images;
}

async function run() {
  const page = await client.fetch<{
    _id: string;
    students?: {
      _key?: string;
      id?: string;
      title?: string;
      headline?: string;
      description?: string;
      images?: unknown[];
      [k: string]: unknown;
    }[];
  } | null>(`*[_id == "teachingPage"][0]{ _id, students }`);

  if (!page?._id) {
    console.error("teachingPage not found — run migrate-pages.ts first.");
    process.exit(1);
  }

  const beforeCounts = (page.students ?? []).map((s) => ({
    id: s.id,
    images: Array.isArray(s.images) ? s.images.length : 0,
  }));
  console.log(
    `Before: ${page.students?.length ?? 0} students`,
    beforeCounts.map((c) => `${c.id}:${c.images}`).join(", "),
  );

  const students = [];
  for (const s of page.students ?? []) {
    if (!s.id || ORIGINAL_IDS.has(s.id)) {
      students.push(s);
      if (s.id && ORIGINAL_IDS.has(s.id)) {
        console.log(`  · skip ${s.id} (original 14)`);
      }
      continue;
    }

    const copy = STUDENT_POPUP_COPY[s.id];
    const images = await uploadSlides(s.id);
    students.push({
      ...s,
      _key: s._key ?? key(),
      ...(copy ? { headline: copy.headline, description: copy.description } : {}),
      ...(images ? { images } : {}),
    });
    console.log(
      `  ✓ ${s.id}${copy ? " copy" : " (copy skipped)"}${images ? ` ${images.length} slides` : ""}`,
    );
  }

  await client.patch(page._id).set({ students }).commit();

  const after = await client.fetch<{
    students?: { id?: string; images?: unknown[] }[];
  }>(`*[_id == "teachingPage"][0]{ students[]{ id, images } }`);
  const afterCounts = (after.students ?? []).map((s) => ({
    id: s.id,
    images: Array.isArray(s.images) ? s.images.length : 0,
  }));
  console.log(
    `After:  ${after.students?.length ?? 0} students`,
    afterCounts.map((c) => `${c.id}:${c.images}`).join(", "),
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
