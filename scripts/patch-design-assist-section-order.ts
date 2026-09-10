/**
 * Design Assist AI — section order (Figma 3719:64864 — no Core Experience Flow).
 *
 * hero → overview → problemContext → accordion →
 * showcaseGallery (Research Artifacts) → interventionCarousel → interventionGrid →
 * statsSection → reflection
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-section-order.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-section-order.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const DRY = process.argv.includes("--dry");
const SLUG = "design-assist-ai";
const PUB_ID = "cs-design-assist-ai";

const DI_TITLE = "Design Interventions";
const RESEARCH_TITLE = "Research Artifacts";
const LEGACY_RESEARCH_TITLE = "Toolkit, Methods & Frameworks";

type Section = Record<string, unknown> & { _key: string; _type: string; sectionTitle?: string };

function pick(
  pool: Section[],
  used: Set<string>,
  predicate: (s: Section) => boolean,
): Section | undefined {
  const s = pool.find((x) => !used.has(x._key) && predicate(x));
  if (s) used.add(s._key);
  return s;
}

function reorderSections(sections: Section[]) {
  const used = new Set<string>();
  const ordered: Section[] = [];

  const push = (s: Section | undefined) => {
    if (s) ordered.push(s);
  };

  push(pick(sections, used, (s) => s._type === "heroSection"));
  push(pick(sections, used, (s) => s._type === "overviewSection"));
  push(pick(sections, used, (s) => s._type === "problemContextSection"));
  push(pick(sections, used, (s) => s._type === "accordionSection"));
  push(
    pick(
      sections,
      used,
      (s) =>
        s._type === "showcaseGallery" &&
        (s.sectionTitle === RESEARCH_TITLE || s.sectionTitle === LEGACY_RESEARCH_TITLE),
    ) ??
      pick(
        sections,
        used,
        (s) => s._type === "showcaseGallery" && s.sectionTitle !== DI_TITLE,
      ),
  );
  push(pick(sections, used, (s) => s._type === "interventionCarousel"));
  push(pick(sections, used, (s) => s._type === "interventionGrid"));
  push(
    pick(
      sections,
      used,
      (s) =>
        s._type === "showcaseGallery" && s.sectionTitle === DI_TITLE,
    ) ??
      pick(sections, used, (s) => s._type === "desktopMotionShowcase"),
  );
  push(pick(sections, used, (s) => s._type === "statsSection"));
  push(pick(sections, used, (s) => s._type === "reflectionSection"));

  for (const s of sections) {
    if (!used.has(s._key) && s._type !== "coreExperience") ordered.push(s);
  }

  return ordered;
}

async function patchDoc(docId: string) {
  const doc = await client.fetch<{ sections: Section[] }>(
    `*[_id == $id][0]{ sections }`,
    { id: docId },
  );
  if (!doc?.sections?.length) {
    console.log(`skip ${docId}: no sections`);
    return;
  }

  const hero = doc.sections.find((s) => s._type === "heroSection") as
    | (Section & { image?: unknown; imageMobile?: unknown })
    | undefined;
  if (!hero?.image && !hero?.imageMobile) {
    throw new Error(
      `${docId}: hero has no images — aborting (run patch-design-assist-restore-from-history.ts first)`,
    );
  }

  const before = doc.sections.map((s) => `${s._type}${s.sectionTitle ? `:${s.sectionTitle}` : ""}`).join(" → ");
  const sections = reorderSections(doc.sections);
  const after = sections.map((s) => `${s._type}${s.sectionTitle ? `:${s.sectionTitle}` : ""}`).join(" → ");

  console.log(`${docId}:`);
  console.log(`  before: ${before}`);
  console.log(`  after:  ${after}`);

  if (DRY) return;

  await client.patch(docId).set({ sections }).commit();
  console.log(`✓ ${docId}: ${doc.sections.length} section(s) reordered`);
}

async function main() {
  console.log(`patch-design-assist-section-order (${DRY ? "dry" : "live"})`);
  await patchDoc(PUB_ID);
  const draftId = `drafts.${PUB_ID}`;
  if (await client.getDocument(draftId)) await patchDoc(draftId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
