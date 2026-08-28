/**
 * Prefill appearance spacing/colors on case-study sections where the frontend
 * used silent Figma fallbacks. Only sets fields that are currently empty.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-case-study-appearance-defaults.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-case-study-appearance-defaults.ts --with-user-token
 *   npx sanity exec scripts/patch-case-study-appearance-defaults.ts --with-user-token -- --slug=coral-health
 */
import { getCliClient } from "sanity/cli";

import {
  SECTION_APPEARANCE_DEFAULTS,
  SECTION_NESTED_APPEARANCE_DEFAULTS,
  mergeAppearanceDefaults,
} from "../src/lib/sanityAppearanceDefaults";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

type Section = Record<string, unknown> & { _key: string; _type: string };

function patchSection(section: Section): { next: Section; notes: string[] } {
  const notes: string[] = [];
  let next: Section = { ...section };

  const bandDefaults = SECTION_APPEARANCE_DEFAULTS[next._type];
  if (bandDefaults) {
    const { next: appearance, changed } = mergeAppearanceDefaults(
      next.appearance as Record<string, unknown> | undefined,
      bandDefaults,
    );
    if (changed.length) {
      next = { ...next, appearance };
      notes.push(`appearance: ${changed.join(", ")}`);
    }
  }

  const nested = SECTION_NESTED_APPEARANCE_DEFAULTS[next._type];
  if (nested?.length) {
    for (const { field, defaults } of nested) {
      const def =
        typeof defaults === "function" ? defaults(next) : defaults;
      const { next: appearance, changed } = mergeAppearanceDefaults(
        next[field] as Record<string, unknown> | undefined,
        def,
      );
      if (changed.length) {
        next = { ...next, [field]: appearance };
        notes.push(`${field}: ${changed.join(", ")}`);
      }
    }
  }

  return { next, notes };
}

function patchSections(sections: Section[]) {
  const notes: string[] = [];
  let changed = false;
  const next = sections.map((s) => {
    const { next: patched, notes: sectionNotes } = patchSection(s);
    if (sectionNotes.length) {
      changed = true;
      notes.push(`${s._type}: ${sectionNotes.join(" | ")}`);
    }
    return patched;
  });
  return { sections: next, notes, changed };
}

async function main() {
  const filter = slugArg
    ? `*[_type == "caseStudy" && slug.current == $slug]._id`
    : `*[_type == "caseStudy"]._id`;
  const params = slugArg ? { slug: slugArg } : {};
  const ids: string[] = await client.fetch(filter, params);

  if (slugArg && !ids.length) {
    console.error(`No case study with slug "${slugArg}"`);
    process.exit(1);
  }

  let docs = 0;

  for (const id of ids) {
    const doc = await client.getDocument(id);
    if (!doc?.sections?.length) continue;

    const { sections, notes, changed } = patchSections(
      doc.sections as Section[],
    );
    if (!changed) continue;

    const slug =
      (doc.slug as { current?: string } | undefined)?.current ??
      id.replace(/^drafts\./, "");
    console.log(`→ ${slug} (${id})`);
    for (const n of notes) console.log(`   ${n}`);
    docs++;

    if (!DRY) await client.patch(id).set({ sections }).commit();
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${docs} doc(s) patched`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
