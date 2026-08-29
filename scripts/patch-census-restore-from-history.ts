/**
 * Restore US Census `sections` from Sanity History (before the bad
 * patch-census-key-product-experiences run that replaced the full array with
 * a minimal projection and wiped hero / overview / accordion / stats / etc.).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-census-restore-from-history.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-census-restore-from-history.ts --with-user-token
 *
 * Then re-run the fixed patch-census-key-product-experiences.ts.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const SLUG = "2020-us-census-benefit-calculator";
/** Just before the destructive full-array replace (~2026-08-29T02:52Z). */
const HISTORY_TIME = "2026-08-29T02:48:00Z";
const DRY = process.argv.includes("--dry");

type Section = { _type?: string; sideImage?: unknown; image?: unknown };

async function main() {
  const pub: { _id: string; sections?: Section[] } = await client.fetch(
    `*[_type == "caseStudy" && slug.current == $slug][0]{ _id, sections[]{ _type, sideImage, image } }`,
    { slug: SLUG },
  );
  if (!pub?._id) throw new Error(`case study not found: ${SLUG}`);

  const resp = await client.request<{ documents?: { sections?: Section[] }[] }>({
    uri: `/data/history/production/documents/${pub._id}?time=${encodeURIComponent(HISTORY_TIME)}`,
    withCredentials: true,
  });
  const hist = resp.documents?.[0]?.sections;
  if (!hist?.length) throw new Error(`No history sections at ${HISTORY_TIME}`);

  const overview = hist.find((s) => s._type === "overviewSection");
  const hero = hist.find((s) => s._type === "heroSection");
  if (!overview?.sideImage && !hero?.image) {
    throw new Error("History snapshot looks empty — aborting");
  }

  console.log(`restore ${SLUG} sections from ${HISTORY_TIME} (${hist.length} sections)`);
  console.log(
    "  types:",
    hist.map((s) => s._type).join(", "),
  );

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  await client.patch(pub._id).set({ sections: hist }).commit();
  console.log("✓ Census sections restored — re-run patch-census-key-product-experiences.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
