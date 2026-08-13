/**
 * Set Work Page stack to 6 icons per row (no re-upload).
 *
 * Run from frontend/:
 *   sanity exec scripts/patch-work-tool-stack-cols.ts --with-user-token
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function main() {
  const docs = await client.fetch<{ _id: string }[]>(
    `*[_type == "workPage"]{ _id }`,
  );
  if (!docs.length) throw new Error("No workPage document");

  for (const doc of docs) {
    await client.patch(doc._id).set({ toolStackPerRow: 6 }).commit();
    console.log(`patched ${doc._id}: toolStackPerRow = 6`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
