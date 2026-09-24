/**
 * Remove §04 Core Experience Flows (coreExperience) from The AR Handbook.
 * Sep 2026 — CE deferred; KPE View More popups carry device views instead.
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-ar-handbook-remove-core-experience.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-ar-handbook-remove-core-experience.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

const PUB_ID = "cs-remote-assistant-object-detection";
const DOC_IDS = [PUB_ID, `drafts.${PUB_ID}`];
const dry = process.argv.includes("--dry");

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
};

function removeCoreExperience(sections: Section[]) {
  const idx = sections.findIndex((s) => s._type === "coreExperience");
  if (idx < 0) return { sections, removed: false as const };
  const next = sections.filter((_, i) => i !== idx);
  return {
    sections: next,
    removed: true as const,
    key: sections[idx]._key,
    title: sections[idx].sectionTitle ?? "(untitled)",
  };
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

    const { sections, removed, key, title } = removeCoreExperience(doc.sections);
    if (!removed) {
      console.log(`skip ${id} — no coreExperience section`);
      continue;
    }

    console.log(
      `${dry ? "(dry run) " : ""}→ ${id}: remove coreExperience "${key}" "${title}" (${doc.sections.length} → ${sections.length} sections)`,
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
