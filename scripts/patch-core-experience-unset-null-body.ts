/**
 * Unset coreExperience.body / popupBody where stored as null — breaks Studio portableText input.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-core-experience-unset-null-body.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-core-experience-unset-null-body.ts --with-user-token
 *   npx sanity exec scripts/patch-core-experience-unset-null-body.ts --with-user-token -- --slug=coral-health
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

type CoreExperienceSection = {
  _key: string;
  _type: "coreExperience";
  body?: unknown;
  popupBody?: unknown;
};

type Section = CoreExperienceSection | { _key: string; _type: string; [k: string]: unknown };

function patchSections(sections: Section[]) {
  const unsetPaths: string[] = [];
  const notes: string[] = [];

  sections.forEach((s, i) => {
    if (s._type !== "coreExperience") return;
    const core = s as CoreExperienceSection;
    if (core.body === null) {
      unsetPaths.push(`sections[${i}].body`);
      notes.push(`sections[${i}].body`);
    }
    if (core.popupBody === null) {
      unsetPaths.push(`sections[${i}].popupBody`);
      notes.push(`sections[${i}].popupBody`);
    }
  });

  return { unsetPaths, notes, changed: unsetPaths.length > 0 };
}

async function main() {
  const filter = slugArg
    ? `*[_type == "caseStudy" && slug.current == $slug]{ _id, "slug": slug.current, sections }`
    : `*[_type == "caseStudy"]{ _id, "slug": slug.current, sections }`;
  const params = slugArg ? { slug: slugArg } : {};
  const docs = await client.fetch<
    { _id: string; slug?: string; sections?: Section[] }[]
  >(filter, params);

  if (slugArg && !docs.length) {
    console.error(`No case study with slug "${slugArg}"`);
    process.exit(1);
  }

  let n = 0;
  for (const doc of docs) {
    if (!doc.sections?.length) continue;
    const { unsetPaths, notes, changed } = patchSections(doc.sections);
    if (!changed) continue;

    console.log(`→ ${doc.slug ?? doc._id}: unset ${notes.join(", ")}`);
    if (!DRY) await client.patch(doc._id).unset(unsetPaths).commit();
    n++;
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${n} doc(s) fixed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
