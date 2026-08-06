/**
 * Add the Core Experience Showcase band to a case study (Fas 08/05, drawn in
 * Figma 2110:39499 for Coral Health).
 *
 * The band is one exported artwork sitting on the band colour — Fas asked for
 * "a section for image, so we can upload our image … it would be for the entire
 * section", so the screens and their captions are baked into the export and
 * only the headline stays as text. The artwork carries the same teal as the
 * band so the two meet seamlessly.
 *
 * Slots in after What I Brought, before Design Process, which is where the
 * 08/05 annotation panel puts it (04, between 03 and 05).
 *
 * Idempotent: re-running replaces the existing band rather than adding a
 * second. Pass --remove to take it out again.
 *
 * Run from frontend/:
 *   sanity exec scripts/add-core-experience.ts --with-user-token
 */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUBLIC = join(process.cwd(), "public");
const REMOVE = process.argv.includes("--remove");

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** One entry per case study that has a Core Experience artwork exported. */
const BANDS = [
  {
    slug: "coral-health",
    sectionTitle: "Core Experience Flow",
    image: "/work/coral-health/core-experience-flow.png",
    // Coral's teal, the same one the band uses in Figma and the same value the
    // artwork is matted on.
    hex: "#52747e",
  },
];

async function uploadImage(p: string) {
  const abs = join(PUBLIC, p.replace(/^\//, ""));
  if (!existsSync(abs)) throw new Error(`missing asset: ${p}`);
  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename: basename(abs),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  for (const band of BANDS) {
    const doc: {
      _id: string;
      sections: { _key: string; _type: string; sectionTitle?: string }[];
    } | null = await client.fetch(
      `*[_type == "caseStudy" && slug.current == $slug][0]{
        _id, "sections": sections[]{ _key, _type, sectionTitle }
      }`,
      { slug: band.slug },
    );
    if (!doc) {
      console.warn(`! no case study for ${band.slug}`);
      continue;
    }

    const existing = doc.sections.findIndex((s) => s._type === "coreExperience");
    if (existing >= 0) {
      await client.patch(doc._id).unset([`sections[${existing}]`]).commit();
      console.log(`${band.slug}: removed existing band at ${existing}`);
      if (REMOVE) continue;
    } else if (REMOVE) {
      console.log(`${band.slug}: nothing to remove`);
      continue;
    }

    const at = doc.sections
      .filter((s) => s._type !== "coreExperience")
      .findIndex((s) => /design process/i.test(s.sectionTitle ?? ""));
    if (at < 0) {
      console.warn(`! ${band.slug}: no Design Process section to sit before`);
      continue;
    }

    const section = {
      _key: key(),
      _type: "coreExperience",
      sectionTitle: band.sectionTitle,
      image: await uploadImage(band.image),
      appearance: {
        _type: "appearance",
        backgroundColor: { _type: "color", hex: band.hex, alpha: 1 },
      },
    };

    await client
      .patch(doc._id)
      .insert("before", `sections[${at}]`, [section])
      .commit();
    console.log(`${band.slug}: inserted Core Experience Showcase at ${at}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
