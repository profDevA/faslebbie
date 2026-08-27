/**
 * Fix Coral Health Studio validation errors on published + draft:
 * - problemContextSection: draft missing bodies (sync from published)
 * - coreExperience: required image missing → restore from history asset ref
 * - accordionSection: required variant null → restore "split" from history
 * - desktopMotionShowcase: ctaUrl "#" invalid → https://coralhealth.app/
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-coral-fix-studio-validation.ts --with-user-token -- --dry
 *   sanity exec scripts/patch-coral-fix-studio-validation.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUB_ID = "cs-coral-health";
const DRAFT_ID = "drafts.cs-coral-health";
const HISTORY_TIME = "2026-08-26T07:59:00Z";
const CTA_URL = "https://coralhealth.app/";
const DRY = process.argv.includes("--dry");

type Section = {
  _key: string;
  _type: string;
  sectionTitle?: string;
  variant?: string;
  image?: unknown;
  ctaUrl?: string;
  problemBody?: unknown;
  broughtBody?: unknown;
};

async function historySections(): Promise<Section[]> {
  const resp = await client.request<{ documents?: { sections?: Section[] }[] }>({
    uri: `/data/history/production/documents/${PUB_ID}?time=${encodeURIComponent(HISTORY_TIME)}`,
    withCredentials: true,
  });
  const sections = resp.documents?.[0]?.sections;
  if (!sections?.length) throw new Error(`No history at ${HISTORY_TIME}`);
  return sections;
}

function idx(sections: Section[], type: string) {
  return sections.findIndex((s) => s._type === type);
}

async function main() {
  const [hist, pub] = await Promise.all([
    historySections(),
    client.getDocument(PUB_ID) as Promise<{ sections: Section[] } | null>,
  ]);
  if (!pub?.sections?.length) {
    console.error(`No published doc ${PUB_ID}`);
    process.exit(1);
  }

  const histCore = hist.find((s) => s._type === "coreExperience");
  const histAccordion = hist.find((s) => s._type === "accordionSection");

  const patch = client.patch(PUB_ID);
  let fixes = 0;

  const coreIdx = idx(pub.sections, "coreExperience");
  if (coreIdx >= 0 && histCore?.image) {
    console.log("coreExperience: restore image from history");
    if (!DRY) patch.set({ [`sections[${coreIdx}].image`]: histCore.image });
    fixes++;
  }

  const accIdx = idx(pub.sections, "accordionSection");
  if (accIdx >= 0 && histAccordion?.variant) {
    console.log(`accordionSection: set variant → ${histAccordion.variant}`);
    if (!DRY) patch.set({ [`sections[${accIdx}].variant`]: histAccordion.variant });
    fixes++;
  }

  const marketingIdx = idx(pub.sections, "desktopMotionShowcase");
  if (marketingIdx >= 0) {
    const cur = pub.sections[marketingIdx] as Section;
    if (!cur.ctaUrl || cur.ctaUrl === "#") {
      console.log(`desktopMotionShowcase: ctaUrl → ${CTA_URL}`);
      if (!DRY) patch.set({ [`sections[${marketingIdx}].ctaUrl`]: CTA_URL });
      fixes++;
    }
  }

  if (!fixes) {
    console.log("Published doc already valid.");
  } else if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  } else {
    await patch.commit();
    console.log(`✓ fixed ${fixes} validation issue(s) on ${PUB_ID}`);
  }

  const updated = (await client.getDocument(PUB_ID)) as { sections: Section[] };
  const draft = await client.getDocument(DRAFT_ID);
  if (!draft) {
    console.log("No draft to sync.");
    return;
  }
  if (DRY) {
    console.log("(dry run — would sync draft sections from published)");
    return;
  }
  await client.patch(DRAFT_ID).set({ sections: updated.sections }).commit();
  console.log(`✓ synced ${DRAFT_ID} from published`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
