import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const doc = await client.fetch<{
    fieldNotes?: { _key?: string; place?: string; quote?: string }[];
  }>(`*[_id == "researchPage"][0]{ fieldNotes[]{ _key, place, quote } }`);
  const notes = doc?.fieldNotes ?? [];
  console.log(`count: ${notes.length}`);
  notes.forEach((n, i) => {
    console.log(`  ${i + 1}. [${n._key}] ${n.place ?? "(no place)"}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
