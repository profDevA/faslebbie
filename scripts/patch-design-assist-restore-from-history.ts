/**
 * Restore Design Assist AI `sections` from Sanity History — the remove-core-experience
 * and section-order patches fetched shallow `{ _key, _type }` arrays and wiped all
 * nested section content (hero, overview, accordion, stats, etc.).
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-design-assist-restore-from-history.ts --with-user-token -- --dry
 *   npx sanity exec scripts/patch-design-assist-restore-from-history.ts --with-user-token
 *
 * After restore, re-run only field-level patches (approach colors, research artifacts).
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PUB_ID = "cs-design-assist-ai";
/** Just before destructive shallow-array patches (~2026-09-10T08:12Z). */
const HISTORY_TIME = "2026-09-10T08:11:00Z";
const DRY = process.argv.includes("--dry");

type Section = {
  _type?: string;
  image?: unknown;
  imageMobile?: unknown;
  problemBody?: unknown;
  items?: unknown[];
};

async function main() {
  const pub: { _id: string; sections?: Section[] } = await client.fetch(
    `*[_id == "${PUB_ID}"][0]{ _id, sections[]{ _type, image, imageMobile, problemBody, "accordionItems": count(items), "statItems": count(items) } }`,
  );
  if (!pub?._id) throw new Error(`Missing ${PUB_ID}`);

  const resp = await client.request<{ documents?: { sections?: Section[] }[] }>({
    uri: `/data/history/production/documents/${PUB_ID}?time=${encodeURIComponent(HISTORY_TIME)}`,
    withCredentials: true,
  });
  const hist = resp.documents?.[0]?.sections;
  if (!hist?.length) throw new Error(`No history sections at ${HISTORY_TIME}`);

  const hero = hist.find((s) => s._type === "heroSection");
  const problem = hist.find((s) => s._type === "problemContextSection");
  if (!hero?.image && !problem?.problemBody) {
    throw new Error("History snapshot looks empty — aborting");
  }

  console.log(`restore ${PUB_ID} sections from ${HISTORY_TIME} (${hist.length} sections)`);
  console.log("  types:", hist.map((s) => s._type).join(" → "));

  if (DRY) {
    console.log("(dry run — nothing written)");
    return;
  }

  await client.patch(PUB_ID).set({ sections: hist }).commit();
  console.log("✓ sections restored");
  console.log("→ re-run: patch-design-assist-approach.ts");
  console.log("→ re-run: patch-design-assist-research-artifacts.ts (field-level only)");
  console.log("→ re-run section-order + field-level patches only after verifying hero images");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
