/**
 * Remove QA placeholder field notes (from repeated dummy patch runs).
 * Keeps every note whose place does NOT start with "Placeholder — second".
 *
 * Run from frontend/:
 *   npx sanity exec scripts/patch-research-field-notes-remove-dummies.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const PLACEHOLDER_PREFIX = "Placeholder — second field note";

async function main() {
  const doc = await client.fetch<{ fieldNotes?: { place?: string }[] }>(
    `*[_id == "researchPage"][0]{ fieldNotes }`,
  );
  const before = doc?.fieldNotes ?? [];
  console.log(`before: ${before.length} field note(s)`);
  before.forEach((n, i) => console.log(`  ${i + 1}. ${n.place ?? "(no place)"}`));

  const kept = before.filter(
    (n) => !n.place?.startsWith(PLACEHOLDER_PREFIX),
  );
  const removed = before.length - kept.length;
  if (removed === 0) {
    console.log("✓ no placeholder notes to remove");
    return;
  }

  await client.patch("researchPage").set({ fieldNotes: kept }).commit();
  console.log(`after: ${kept.length} field note(s) (removed ${removed} placeholder(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
