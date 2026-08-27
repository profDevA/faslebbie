/**
 * Append the 8 Figma 3105:5780 student works onto teachingPage, and set the
 * exhibition page heading / intro / CTA. Does not replace existing students
 * or exhibition tiles.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-teaching-student-extras.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { getCliClient } from "sanity/cli";

import { EXTRA_STUDENT_WORKS } from "./data/extraStudentWorks";

const client = getCliClient({ apiVersion: "2025-01-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const EXHIBITION_HEADING = "My Student Exhibitions";
const EXHIBITION_INTRO =
  "A public look at what my students have been building, moving from the classroom into installations, prototypes, critique walls, material experiments, and interactive demos. These exhibitions give students a chance to test ideas, share research, and see how their work lands with a wider audience.";
const EXHIBITION_CTA = "See their case studies";

async function uploadCover(id: string): Promise<string | undefined> {
  const relative = path.join("public", "teaching", "student-covers", `${id}.png`);
  const file = path.join(process.cwd(), relative);
  try {
    await access(file);
  } catch {
    console.warn(`  ! missing cover: ${relative}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: `${id}.png`,
  });
  return asset._id;
}

async function run() {
  const before = await client.fetch<{
    students?: { id?: string }[];
    exhibitionTiles?: unknown[];
  } | null>(`*[_id == "teachingPage"][0]{ students[]{ id }, exhibitionTiles }`);

  if (!before) {
    console.error("teachingPage not found — run migrate-pages.ts first.");
    process.exit(1);
  }

  const have = new Set((before.students ?? []).map((s) => s.id).filter(Boolean));
  console.log(
    `Before: ${before.students?.length ?? 0} students, ${before.exhibitionTiles?.length ?? 0} exhibition tiles`,
  );

  const appended = [];
  for (const p of EXTRA_STUDENT_WORKS) {
    if (have.has(p.id)) {
      console.log(`  skip ${p.id} — already in Sanity`);
      continue;
    }
    const assetId = await uploadCover(p.id);
    appended.push({
      _type: "studentProject",
      _key: key(),
      id: p.id,
      title: p.title,
      headline: p.headline,
      description: p.description,
      span: p.span,
      tint: p.tint,
      ...(assetId
        ? {
            images: [
              {
                _type: "image",
                _key: key(),
                asset: { _type: "reference", _ref: assetId },
              },
            ],
          }
        : {}),
    });
    console.log(`  + ${p.id}${assetId ? " (cover uploaded)" : ""}`);
  }

  let patch = client.patch("teachingPage").set({
    exhibitionHeading: EXHIBITION_HEADING,
    exhibitionIntro: EXHIBITION_INTRO,
    exhibitionCta: EXHIBITION_CTA,
  });

  if (appended.length) {
    patch = patch.insert("after", "students[-1]", appended);
  }

  await patch.commit();

  const after = await client.fetch<{
    students?: unknown[];
    exhibitionTiles?: unknown[];
  }>(`*[_id == "teachingPage"][0]{ students, exhibitionTiles }`);

  console.log(
    `After:  ${after.students?.length ?? 0} students, ${after.exhibitionTiles?.length ?? 0} exhibition tiles`,
  );
  console.log("✓ exhibition heading / intro / CTA set on teachingPage");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
