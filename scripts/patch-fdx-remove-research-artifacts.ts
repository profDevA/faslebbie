/**
 * Remove §06 Research Artifacts (showcaseGallery) from Financial Data Exchange.
 * Israel: section no longer applies to FDX.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-fdx-remove-research-artifacts.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-fdx-remove-research-artifacts.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const SLUG = "financial-data-exchange";
const DOC_IDS = ["cs-financial-data-exchange", "drafts.cs-financial-data-exchange"];
const dry = process.argv.includes("--dry");

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
};

function removeResearchArtifacts(sections: Section[]) {
  const idx = sections.findIndex(
    (s) =>
      s._type === "showcaseGallery" &&
      (s.sectionTitle ?? "").trim().toLowerCase() === "research artifacts",
  );
  if (idx < 0) return { sections, removed: false as const };
  const next = sections.filter((_, i) => i !== idx);
  return { sections: next, removed: true as const, key: sections[idx]._key };
}

async function main() {
  for (const id of DOC_IDS) {
    const doc = await client.fetch<{ sections: Section[] }>(
      `*[_id == $id][0]{ sections[] }`,
      { id },
    );
    if (!doc?.sections?.length) {
      console.log(`skip ${id} — not found or no sections`);
      continue;
    }

    const { sections, removed, key } = removeResearchArtifacts(doc.sections);
    if (!removed) {
      console.log(`skip ${id} — no Research Artifacts showcaseGallery`);
      continue;
    }

    console.log(
      `${dry ? "(dry run) " : ""}→ ${id}: remove showcaseGallery "${key}" (${doc.sections.length} → ${sections.length} sections)`,
    );
    if (!dry) {
      await client.patch(id).set({ sections }).commit();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
