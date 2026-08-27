/**
 * Restore Coral Health nested arrays lost on the published doc (hero, highlight,
 * accordion items, stats). Draft still has the source data.
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-restore-hero-highlight.ts --with-user-token -- --dry
 *   sanity exec scripts/patch-coral-restore-hero-highlight.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUB_ID = "cs-coral-health";
const DRAFT_ID = "drafts.cs-coral-health";
const DRY = process.argv.includes("--dry");

type Section = {
  _key: string;
  _type: string;
  image?: unknown;
  cells?: unknown;
  items?: unknown;
};

function idx(sections: Section[], type: string) {
  return sections.findIndex((s) => s._type === type);
}

async function main() {
  const [pub, draft] = await Promise.all([
    client.fetch<{ sections: Section[] } | null>(
      `*[_id == $id][0]{ sections[]{ _key, _type, image, cells, items } }`,
      { id: PUB_ID },
    ),
    client.fetch<{ sections: Section[] } | null>(
      `*[_id == $id][0]{ sections[]{ _key, _type, image, cells, items } }`,
      { id: DRAFT_ID },
    ),
  ]);

  if (!pub?.sections?.length || !draft?.sections?.length) {
    console.error("Missing published or draft coral doc");
    process.exit(1);
  }

  const patch = client.patch(PUB_ID);
  let changes = 0;

  const heroPub = idx(pub.sections, "heroSection");
  const heroDraft = draft.sections.find((s) => s._type === "heroSection");
  if (heroPub >= 0 && heroDraft?.image) {
    console.log("hero image: restore");
    if (!DRY) patch.set({ [`sections[${heroPub}].image`]: heroDraft.image });
    changes++;
  }

  const highlightPub = idx(pub.sections, "highlightReel");
  const highlightDraft = draft.sections.find((s) => s._type === "highlightReel");
  if (highlightPub >= 0 && highlightDraft?.cells) {
    const n = Array.isArray(highlightDraft.cells) ? highlightDraft.cells.length : 0;
    console.log(`highlight cells: restore ${n}`);
    if (!DRY) patch.set({ [`sections[${highlightPub}].cells`]: highlightDraft.cells });
    changes++;
  }

  const accPub = idx(pub.sections, "accordionSection");
  const accDraft = draft.sections.find((s) => s._type === "accordionSection");
  if (accPub >= 0 && accDraft?.items) {
    const n = Array.isArray(accDraft.items) ? accDraft.items.length : 0;
    console.log(`accordion items: restore ${n}`);
    if (!DRY) patch.set({ [`sections[${accPub}].items`]: accDraft.items });
    changes++;
  }

  const statsPub = idx(pub.sections, "statsSection");
  const statsDraft = draft.sections.find((s) => s._type === "statsSection");
  if (statsPub >= 0 && statsDraft?.items) {
    const n = Array.isArray(statsDraft.items) ? statsDraft.items.length : 0;
    console.log(`stats items: restore ${n}`);
    if (!DRY) patch.set({ [`sections[${statsPub}].items`]: statsDraft.items });
    changes++;
  }

  if (!changes) {
    console.log("Nothing to restore.");
    return;
  }
  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }
  await patch.commit();
  console.log(`✓ restored ${changes} section field(s) on ${PUB_ID}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
