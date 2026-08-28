/**
 * Remove legacy string padding/gap tokens from appearance objects.
 * Schema is number-only; old migrations left "sm", "md", "none" etc. which
 * Studio rejects ("Expected type Number, got String").
 *
 * Frontend still resolves legacy tokens at render time if any remain; empty
 * fields use template defaults.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-appearance-legacy-strings.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-appearance-legacy-strings.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");

const SPACING_KEYS = ["paddingTop", "paddingBottom", "contentGap", "contentGapInner"] as const;

type Section = {
  _key: string;
  _type: string;
  appearance?: Record<string, unknown>;
  [k: string]: unknown;
};

function cleanAppearance(a?: Record<string, unknown>) {
  if (!a) return { changed: false, next: a };
  const next = { ...a };
  let changed = false;
  for (const k of SPACING_KEYS) {
    const v = next[k];
    if (typeof v === "string") {
      delete next[k];
      changed = true;
    }
  }
  return { changed, next: changed ? next : a };
}

function cleanSections(sections: Section[]) {
  let fixes = 0;
  const next = sections.map((s) => {
    const { changed, next: appearance } = cleanAppearance(s.appearance as Record<string, unknown> | undefined);
    if (!changed) return s;
    fixes++;
    return { ...s, appearance };
  });
  return { sections: next, fixes };
}

async function main() {
  const ids: string[] = await client.fetch(`*[_type == "caseStudy"]._id`);
  let docs = 0;
  let fields = 0;

  for (const id of ids) {
    const doc = await client.getDocument(id);
    if (!doc?.sections?.length) continue;

    const { sections, fixes } = cleanSections(doc.sections as Section[]);
    if (!fixes) continue;

    console.log(`→ ${id}: cleaned ${fixes} section appearance(s)`);
    fields += fixes;
    docs++;
    if (!DRY) await client.patch(id).set({ sections }).commit();
  }

  console.log(`\n${DRY ? "(dry run) " : ""}${docs} doc(s), ${fields} appearance block(s) cleaned`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
